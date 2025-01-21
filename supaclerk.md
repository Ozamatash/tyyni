Overview

Overview

Clerk authenticates users, manages session tokens, and provides user management functionality that can be used in combination with the authorization logic available in Supabase through PostgreSQL Row Level Security (RLS) policies.

Documentation

This guide explains how to connect your Supabase database with Clerk.

Clerk is a user management platform that provides beautifully designed, drop-in UI components to quickly add authentication capabilities to your application. Clerk supports numerous sign-in strategies such as social providers, email links, and passkeys, as well as a suite of B2B SaaS tools and APIs to build your own authentication flows.

The Clerk integration uses the authorization logic available in Supabase through PostgreSQL Row Level Security (RLS) policies.

This guide assumes you have a Supabase account and database project already set up.

If you don't have a Clerk account, you can create an account for free.

How the integration works

RLS works by validating database queries according to the restrictions defined in the RLS policies applied to the table. This guide will show you how to create RLS policies that restrict access to data based on the user's Clerk ID. This way, users can only access data that belongs to them.

To set this up, you will:

Create a function in Supabase to parse the Clerk user ID from the authentication token.
Create a user_id column that defaults to the Clerk user's ID when new records are created.
Create policies to restrict what data can be read and inserted.
Use the Clerk Supabase integration helper in your code to authenticate with Supabase and execute queries.
1: Create a function to check the incoming user ID

Create a function named requesting_user_id() that will parse the Clerk user ID from the authentication token. This function will be used to set the default value of user_id in a table and in the RLS policies to ensure the user can only access their data.

In the sidebar of your Supabase dashboard, navigate to Database > Functions.

Select Create a new function.

In the Add a new function sheet, make the following changes:

Set Name of function to requesting_user_id.
Set Return type to text.
Toggle Show advanced settings on.
Set Language to sql.
Populate the Definition with the following sql:
SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
)::text;

Select Confirm.
2: Create a user_id column

💡 The following steps will need to be performed on any tables you wish to secure.
Next, you’ll create a user_id column in the table you wish to secure. This column will be used in the RLS policies to only return or modify records scoped to the user's account and it will use the requesting_user_id() function you just created as its default value.

Navigate to the sidebar on the left and select Table Editor.
Select the table you wish to secure.
In the table, select the + column to add a new column.
Set the Name to user_id.
Set Type to text.
Set Default Value to requesting_user_id().
Select Save to create the column.
3: Enable RLS on your table and create the policies

To enable RLS on your table:

In the top bar above the table, select RLS disabled and then Enable RLS for this table.
In the modal that appears, select Enable RLS.
Select the Add RLS policy button (which has replaced RLS disabled).
Create two policies: one to enforce that the data returned has a user_id value that matches the requestor, and another to automatically insert records with the ID of the requestor.

Select Create policy to create the SELECT policy:
Provide a name for the policy.

For Policy Command, select SELECT.

For Target roles, select authenticated.

Replace the "-- Provide a SQL expression for the using statement" with the following:

requesting_user_id() = user_id

Select Save policy.

Select Create policy to create the INSERT policy:
Provide a name for the policy.

For Policy Command, select INSERT.

For Target roles, select authenticated.

Replace the "-- Provide a SQL expression for the with check statement" with the following:

requesting_user_id() = user_id

Select Save policy.

4: Get your Supabase JWT secret key

To give users access to your data, Supabase's API requires an authentication token. Your Clerk project can generate these authentication tokens, but it needs your Supabase project's JWT secret key first.

To find the JWT secret key:

In the sidebar of your Supabase dashboard, navigate to Project Settings > API.
Under the JWT Settings section, save the value in the JWT Secret field somewhere secure. This value will be used in the next step.
5: Create a Supabase JWT template

Clerk's JWT templates allow you to generate a new valid Supabase authentication token for each signed-in user. These tokens allow authenticated users to access your data with Supabase's API.

To create a Clerk JWT template for Supabase:

Navigate to the Clerk Dashboard.
In the navigation sidebar, select JWT Templates.
Select the New template button, then select Supabase from the list of options.
Configure your template:
The value of the Name field will be required when using the template in your code. For this tutorial, name it supabase.
Signing algorithm will be HS256 by default. This algorithm is required to use JWTs with Supabase. Learn more in the Supabase docs.
Under Signing key, add the value of your Supabase JWT secret key from the previous step.
You can leave all other fields at their default settings or customize them to your needs. See the Clerk JWT template guide to learn more about these settings.
Select Save from the notification bubble to complete setup.
6: Configure your application

The next step is to configure your client. Supabase provides an official JavaScript/TypeScript client library and there are libraries in other languages built by the community.

This guide will use a Next.js project with the JS client as an example, but the mechanism of setting the authentication token should be similar to other libraries and frameworks.

Set up Clerk

To configure Clerk in your Next.js application, follow the Next.js Quickstart available in the Clerk docs. The linked guide will walk you through the basics of configuring Clerk by adding sign-up and sign-in functionality to your application.

Configure the Supabase client

Next, the Supabase client used to query and modify data in your Supabase database needs to be modified to use the Clerk token as part of the request headers. This can be done by customizing the fetch that is used by Supabase like so:

import { useSession, useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

export default function Home() {
	// The `useSession()` hook will be used to get the Clerk `session` object
	const { session } = useSession()
	
	// Create a custom supabase client that injects the Clerk Supabase token into the request headers
	function createClerkSupabaseClient() {
	  return createClient(
	    process.env.NEXT_PUBLIC_SUPABASE_URL!,
	    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
	    {
	      global: {
	        // Get the custom Supabase token from Clerk
	        fetch: async (url, options = {}) => {
		        // The Clerk `session` object has the getToken() method      
	          const clerkToken = await session?.getToken({
		          // Pass the name of the JWT template you created in the Clerk Dashboard
		          // For this tutorial, you named it 'supabase'
	            template: 'supabase',
	          })
	          
	          // Insert the Clerk Supabase token into the headers
		        const headers = new Headers(options?.headers)
	          headers.set('Authorization', `Bearer ${clerkToken}`)
	          
	          // Call the default fetch
	          return fetch(url, {
	            ...options,
	            headers,
	          })
	        },
	      },
	    },
	  )
	}
	
	//... The rest of the code is removed for brevity
}

Then the client can be created and used throughout the application:

const client = createClerkSupabaseClient()

If you have previously followed the Supabase Next.js guide, you’d replace any use of the createClient function with the one above.

Example

The following example demonstrates how this technique is used in a to-do application that queries data from and inserts data into a tasks table, which will be secured with the RLS policies created in previous steps:

'use client'
import { useEffect, useState } from 'react'
import { useSession, useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  // The `useUser()` hook will be used to ensure that Clerk has loaded data about the logged in user
  const { user } = useUser()
  // The `useSession()` hook will be used to get the Clerk `session` object
  const { session } = useSession()

  // Create a custom supabase client that injects the Clerk Supabase token into the request headers
  function createClerkSupabaseClient() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
      {
        global: {
          // Get the custom Supabase token from Clerk
          fetch: async (url, options = {}) => {
            const clerkToken = await session?.getToken({
              template: 'supabase',
            })

            // Insert the Clerk Supabase token into the headers
            const headers = new Headers(options?.headers)
            headers.set('Authorization', `Bearer ${clerkToken}`)

            // Call the default fetch
            return fetch(url, {
              ...options,
              headers,
            })
          },
        },
      },
    )
  }

  // Create a `client` object for accessing Supabase data using the Clerk token
  const client = createClerkSupabaseClient()

  // This `useEffect` will wait for the `user` object to be loaded before requesting
  // the tasks for the logged in user
  useEffect(() => {
    if (!user) return

    async function loadTasks() {
      setLoading(true)
      const { data, error } = await client.from('tasks').select()
      if (!error) setTasks(data)
      setLoading(false)
    }

    loadTasks()
  }, [user])

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Insert task into the "tasks" database
    await client.from('tasks').insert({
      name,
    })
    window.location.reload()
  }

  return (
    <div>
      <h1>Tasks</h1>

      {loading && <p>Loading...</p>}

      {!loading && tasks.length > 0 && tasks.map((task: any) => <p>{task.name}</p>)}

      {!loading && tasks.length === 0 && <p>No tasks found</p>}

      <form onSubmit={createTask}>
        <input
          autoFocus
          type="text"
          name="name"
          placeholder="Enter new task"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <button type="submit">Add</button>
      </form>
    </div>
  )
}