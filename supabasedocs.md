DATABASE:

Initializing
Create a new client for use in the browser.

You can initialize a new Supabase client using the createClient() method.

The Supabase client is your entrypoint to the rest of the Supabase functionality and is the easiest way to interact with everything we offer within the Supabase ecosystem.
Parameters

supabaseUrl
REQUIRED
string
The unique Supabase URL which is supplied when you create a new project in your project dashboard.
supabaseKey
REQUIRED
string
The unique Supabase Key which is supplied when you create a new project in your project dashboard.
options
Optional
SupabaseClientOptions
Details
Creating a client
With a custom domain
With additional parameters
With custom schemas
Custom fetch implementation
React Native options with AsyncStorage
React Native options with Expo SecureStore
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')

TypeScript support
supabase-js has TypeScript support for type inference, autocompletion, type-safe queries, and more.

With TypeScript, supabase-js detects things like not null constraints and generated columns. Nullable columns are typed as T | null when you select the column. Generated columns will show a type error when you insert to it.

supabase-js also detects relationships between tables. A referenced table with one-to-many relationship is typed as T[]. Likewise, a referenced table with many-to-one relationship is typed as T | null.

Generating TypeScript Types#

You can use the Supabase CLI to generate the types. You can also generate the types from the dashboard.

Terminal

supabase gen types typescript --project-id abcdefghijklmnopqrst > database.types.ts
These types are generated from your database schema. Given a table public.movies, the generated types will look like:

create table public.movies (
  id bigint generated always as identity primary key,
  name text not null,
  data jsonb null
);

./database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      movies: {
        Row: {               // the data expected from .select()
          id: number
          name: string
          data: Json | null
        }
        Insert: {            // the data to be passed to .insert()
          id?: never         // generated columns must not be supplied
          name: string       // `not null` columns with no default must be supplied
          data?: Json | null // nullable columns can be omitted
        }
        Update: {            // the data to be passed to .update()
          id?: never
          name?: string      // `not null` columns are optional on .update()
          data?: Json | null
        }
      }
    }
  }
}
Using TypeScript type definitions#

You can supply the type definitions to supabase-js like so:

./index.tsx

import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)
Helper types for Tables and Joins#

You can use the following helper types to make the generated TypeScript types easier to use.

Sometimes the generated types are not what you expect. For example, a view's column may show up as nullable when you expect it to be not null. Using type-fest, you can override the types like so:

./database-generated.types.ts

export type Json = // ...

export interface Database {
  // ...
}
./database.types.ts

import { MergeDeep } from 'type-fest'
import { Database as DatabaseGenerated } from './database-generated.types'
export { Json } from './database-generated.types'

// Override the type for a specific column in a view:
export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Views: {
        movies_view: {
          Row: {
            // id is a primary key in public.movies, so it must be `not null`
            id: number
          }
        }
      }
    }
  }
>
You can also override the type of an individual successful response if needed:

const { data } = await supabase.from('countries').select().returns<MyType>()

The generated types provide shorthands for accessing tables and enums.

./index.ts

import { Database, Tables, Enums } from "./database.types.ts";

// Before 😕
let movie: Database['public']['Tables']['movies']['Row'] = // ...

// After 😍
let movie: Tables<'movies'>
Response types for complex queries#

supabase-js always returns a data object (for success), and an error object (for unsuccessful requests).

These helper types provide the result types from any query, including nested types for database joins.

Given the following schema with a relation between cities and countries, we can get the nested CountriesWithCities type:

create table countries (
  "id" serial primary key,
  "name" text
);

create table cities (
  "id" serial primary key,
  "name" text,
  "country_id" int references "countries"
);

import { QueryResult, QueryData, QueryError } from '@supabase/supabase-js'

const countriesWithCitiesQuery = supabase
  .from("countries")
  .select(`
    id,
    name,
    cities (
      id,
      name
    )
  `);
type CountriesWithCities = QueryData<typeof countriesWithCitiesQuery>;

const { data, error } = await countriesWithCitiesQuery;
if (error) throw error;
const countriesWithCities: CountriesWithCities = data;

Fetch data
Perform a SELECT query on the table or view.

By default, Supabase projects return a maximum of 1,000 rows. This setting can be changed in your project's API settings. It's recommended that you keep it low to limit the payload size of accidental or malicious requests. You can use range() queries to paginate through your data.
select() can be combined with Filters
select() can be combined with Modifiers
apikey is a reserved keyword if you're using the Supabase Platform and should be avoided as a column name.
Parameters

columns
Optional
Query
The columns to retrieve, separated by commas. Columns can be renamed when returned with customName:columnName
options
REQUIRED
object
Named parameters
Details
Getting your data
Selecting specific columns
Query referenced tables
Query referenced tables through a join table
Query the same referenced table multiple times
Query nested foreign tables through a join table
Filtering through referenced tables
Querying referenced table with count
Querying with count option
Querying JSON data
Querying referenced table with inner join
Switching schemas per query
const { data, error } = await supabase
  .from('countries')
  .select()

Data source
Response
Insert data
Perform an INSERT into the table or view.
Parameters

values
REQUIRED
Union: expand to see options
The values to insert. Pass an object to insert a single row or an array to insert multiple rows.
Details
options
Optional
object
Named parameters
Details
Create a record
Create a record and return it
Bulk create
const { error } = await supabase
  .from('countries')
  .insert({ id: 1, name: 'Denmark' })

Data source
Response
Update data
Perform an UPDATE on the table or view.

update() should always be combined with Filters to target the item(s) you wish to update.
Parameters

values
REQUIRED
Row
The values to update with
options
REQUIRED
object
Named parameters
Details
Updating your data
Update a record and return it
Updating JSON data
const { error } = await supabase
  .from('countries')
  .update({ name: 'Australia' })
  .eq('id', 1)

Data source
Response
Upsert data
Perform an UPSERT on the table or view. Depending on the column(s) passed to onConflict, .upsert() allows you to perform the equivalent of .insert() if a row with the corresponding onConflict columns doesn't exist, or if it does exist, perform an alternative action depending on ignoreDuplicates.

Primary keys must be included in values to use upsert.
Parameters

values
REQUIRED
Union: expand to see options
The values to upsert with. Pass an object to upsert a single row or an array to upsert multiple rows.
Details
options
Optional
object
Named parameters
Details
Upsert your data
Bulk Upsert your data
Upserting into tables with constraints
const { data, error } = await supabase
  .from('countries')
  .upsert({ id: 1, name: 'Albania' })
  .select()

Data source
Response
Delete data
Perform a DELETE on the table or view.

delete() should always be combined with filters to target the item(s) you wish to delete.
If you use delete() with filters and you have RLS enabled, only rows visible through SELECT policies are deleted. Note that by default no rows are visible, so you need at least one SELECT/ALL policy that makes the rows visible.
When using delete().in(), specify an array of values to target multiple rows with a single query. This is particularly useful for batch deleting entries that share common criteria, such as deleting users by their IDs. Ensure that the array you provide accurately represents all records you intend to delete to avoid unintended data removal.
Parameters

options
REQUIRED
object
Named parameters
Details
Delete a single record
Delete a record and return it
Delete multiple records
const response = await supabase
  .from('countries')
  .delete()
  .eq('id', 1)

Data source
Response
Call a Postgres function
Perform a function call.

You can call Postgres functions as Remote Procedure Calls, logic in your database that you can execute from anywhere. Functions are useful when the logic rarely changes—like for password resets and updates.

create or replace function hello_world() returns text as $$
  select 'Hello world';
$$ language sql;

To call Postgres functions on Read Replicas, use the get: true option.
Parameters

fn
REQUIRED
FnName
The function name to call
args
REQUIRED
Fn['Args']
The arguments to pass to the function call
options
REQUIRED
object
Named parameters
Details
Call a Postgres function without arguments
Call a Postgres function with arguments
Bulk processing
Call a Postgres function with filters
Call a read-only Postgres function
const { data, error } = await supabase.rpc('hello_world')

Data source
Response
Using filters
Filters allow you to only return rows that match certain conditions.

Filters can be used on select(), update(), upsert(), and delete() queries.

If a Postgres function returns a table response, you can also apply filters.
Applying Filters
Chaining
Conditional Chaining
Filter by values within a JSON column
Filter referenced tables
const { data, error } = await supabase
  .from('cities')
  .select('name, country_id')
  .eq('name', 'The Shire')    // Correct

const { data, error } = await supabase
  .from('cities')
  .eq('name', 'The Shire')    // Incorrect
  .select('name, country_id')

Notes
Column is equal to a value
Match only rows where column is equal to value.
Parameters

column
REQUIRED
Union: expand to see options
The column to filter on
Details
value
REQUIRED
NonNullable
The value to filter with
With `select()`
const { data, error } = await supabase
  .from('countries')
  .select()
  .eq('name', 'Albania')

Data source
Response
Column is not equal to a value
Match only rows where column is not equal to value.
Parameters

column
REQUIRED
Union: expand to see options
The column to filter on
Details
value
REQUIRED
Union: expand to see options
The value to filter with
Details
With `select()`
const { data, error } = await supabase
  .from('countries')
  .select()
  .neq('name', 'Albania')

Data source
Response
Column is greater than a value
Match only rows where column is greater than value.
Parameters

column
REQUIRED
Union: expand to see options
The column to filter on
Details
value
REQUIRED
Union: expand to see options
The value to filter with
Details
With `select()`
const { data, error } = await supabase
  .from('countries')
  .select()
  .gt('id', 2)

Data source
Response
Notes
Column is greater than or equal to a value
Match only rows where column is greater than or equal to value.
Parameters

column
REQUIRED
Union: expand to see options
The column to filter on
Details
value
REQUIRED
Union: expand to see options
The value to filter with
Details
With `select()`
const { data, error } = await supabase
  .from('countries')
  .select()
  .gte('id', 2)

Data source
Response
Column is less than a value
Match only rows where column is less than value.
Parameters

column
REQUIRED
Union: expand to see options
The column to filter on
Details
value
REQUIRED
Union: expand to see options
The value to filter with
Details
With `select()`
const { data, error } = await supabase
  .from('countries')
  .select()
  .lt('id', 2)

Data source
Response
Column is less than or equal to a value
Match only rows where column is less than or equal to value.
Parameters

column
REQUIRED
Union: expand to see options
The column to filter on
Details
value
REQUIRED
Union: expand to see options
The value to filter with
Details
With `select()`
const { data, error } = await supabase
  .from('countries')
  .select()
  .lte('id', 2)

Data source
Response
Column matches a pattern
Match only rows where column matches pattern case-sensitively.
Parameters

column
REQUIRED
Union: expand to see options
The column to filter on
Details
pattern
REQUIRED
string
The pattern to match with
With `select()`
const { data, error } = await supabase
  .from('countries')
  .select()
  .like('name', '%Alba%')

Data source
Response
Column matches a case-insensitive pattern
Match only rows where column matches pattern case-insensitively.
Parameters

column
REQUIRED
Union: expand to see options
The column to filter on
Details
pattern
REQUIRED
string
The pattern to match with
With `select()`
const { data, error } = await supabase
  .from('countries')
  .select()
  .ilike('name', '%alba%')

Data source
Response
Column is a value
Match only rows where column IS value.
Parameters

column
REQUIRED
Union: expand to see options
The column to filter on
Details
value
REQUIRED
Union: expand to see options
The value to filter with
Details
Checking for nullness, true or false
const { data, error } = await supabase
  .from('countries')
  .select()
  .is('name', null)

Data source
Response
Notes
Column is in an array
Match only rows where column is included in the values array.
Parameters

column
REQUIRED
Union: expand to see options
The column to filter on
Details
values
REQUIRED
Array<Row['ColumnName']>
The values array to filter with
With `select()`
const { data, error } = await supabase
  .from('countries')
  .select()
  .in('name', ['Albania', 'Algeria'])

Data source
Response
Column contains every element in a value
Only relevant for jsonb, array, and range columns. Match only rows where column contains every element appearing in value.
Parameters

column
REQUIRED
Union: expand to see options
The jsonb, array, or range column to filter on
Details
value
REQUIRED
Union: expand to see options
The jsonb, array, or range value to filter with
Details
On array columns
On range columns
On `jsonb` columns
const { data, error } = await supabase
  .from('issues')
  .select()
  .contains('tags', ['is:open', 'priority:low'])

Data source
Response
Contained by value
Only relevant for jsonb, array, and range columns. Match only rows where every element appearing in column is contained by value.
Parameters

column
REQUIRED
Union: expand to see options
The jsonb, array, or range column to filter on
Details
value
REQUIRED
Union: expand to see options
The jsonb, array, or range value to filter with
Details
On array columns
On range columns
On `jsonb` columns
const { data, error } = await supabase
  .from('classes')
  .select('name')
  .containedBy('days', ['monday', 'tuesday', 'wednesday', 'friday'])

Data source
Response
Greater than a range
Only relevant for range columns. Match only rows where every element in column is greater than any element in range.
Parameters

column
REQUIRED
Union: expand to see options
The range column to filter on
Details
range
REQUIRED
string
The range to filter with
With `select()`
const { data, error } = await supabase
  .from('reservations')
  .select()
  .rangeGt('during', '[2000-01-02 08:00, 2000-01-02 09:00)')

Data source
Response
Notes
Greater than or equal to a range
Only relevant for range columns. Match only rows where every element in column is either contained in range or greater than any element in range.
Parameters

column
REQUIRED
Union: expand to see options
The range column to filter on
Details
range
REQUIRED
string
The range to filter with
With `select()`
const { data, error } = await supabase
  .from('reservations')
  .select()
  .rangeGte('during', '[2000-01-02 08:30, 2000-01-02 09:30)')

Data source
Response
Notes
Less than a range
Only relevant for range columns. Match only rows where every element in column is less than any element in range.
Parameters

column
REQUIRED
Union: expand to see options
The range column to filter on
Details
range
REQUIRED
string
The range to filter with
With `select()`
const { data, error } = await supabase
  .from('reservations')
  .select()
  .rangeLt('during', '[2000-01-01 15:00, 2000-01-01 16:00)')

Data source
Response
Notes
Less than or equal to a range
Only relevant for range columns. Match only rows where every element in column is either contained in range or less than any element in range.
Parameters

column
REQUIRED
Union: expand to see options
The range column to filter on
Details
range
REQUIRED
string
The range to filter with
With `select()`
const { data, error } = await supabase
  .from('reservations')
  .select()
  .rangeLte('during', '[2000-01-01 14:00, 2000-01-01 16:00)')

Data source
Response
Notes
Mutually exclusive to a range
Only relevant for range columns. Match only rows where column is mutually exclusive to range and there can be no element between the two ranges.
Parameters

column
REQUIRED
Union: expand to see options
The range column to filter on
Details
range
REQUIRED
string
The range to filter with
With `select()`
const { data, error } = await supabase
  .from('reservations')
  .select()
  .rangeAdjacent('during', '[2000-01-01 12:00, 2000-01-01 13:00)')

Data source
Response
Notes
With a common element
Only relevant for array and range columns. Match only rows where column and value have an element in common.
Parameters

column
REQUIRED
Union: expand to see options
The array or range column to filter on
Details
value
REQUIRED
Union: expand to see options
The array or range value to filter with
Details
On array columns
On range columns
const { data, error } = await supabase
  .from('issues')
  .select('title')
  .overlaps('tags', ['is:closed', 'severity:high'])

Data source
Response
Match a string
Only relevant for text and tsvector columns. Match only rows where column matches the query string in query.

For more information, see Postgres full text search.
Parameters

column
REQUIRED
Union: expand to see options
The text or tsvector column to filter on
Details
query
REQUIRED
string
The query text to match with
options
Optional
object
Named parameters
Details
Text search
Basic normalization
Full normalization
Websearch
const result = await supabase
  .from("texts")
  .select("content")
  .textSearch("content", `'eggs' & 'ham'`, {
    config: "english",
  });

Data source
Response
Match an associated value
Match only rows where each column in query keys is equal to its associated value. Shorthand for multiple .eq()s.
Parameters

query
REQUIRED
Union: expand to see options
The object to filter with, with column names as keys mapped to their filter values
Details
With `select()`
const { data, error } = await supabase
  .from('countries')
  .select('name')
  .match({ id: 2, name: 'Albania' })

Data source
Response
Don't match the filter
Match only rows which doesn't satisfy the filter.

not() expects you to use the raw PostgREST syntax for the filter values.

.not('id', 'in', '(5,6,7)')  // Use `()` for `in` filter
.not('arraycol', 'cs', '{"a","b"}')  // Use `cs` for `contains()`, `{}` for array values

Parameters

column
REQUIRED
Union: expand to see options
The column to filter on
Details
operator
REQUIRED
Union: expand to see options
The operator to be negated to filter with, following PostgREST syntax
Details
value
REQUIRED
Union: expand to see options
The value to filter with, following PostgREST syntax
Details
With `select()`
const { data, error } = await supabase
  .from('countries')
  .select()
  .not('name', 'is', null)

Data source
Response
Match at least one filter
Match only rows which satisfy at least one of the filters.

or() expects you to use the raw PostgREST syntax for the filter names and values.

.or('id.in.(5,6,7), arraycol.cs.{"a","b"}')  // Use `()` for `in` filter, `{}` for array values and `cs` for `contains()`.
.or('id.in.(5,6,7), arraycol.cd.{"a","b"}')  // Use `cd` for `containedBy()`

Parameters

filters
REQUIRED
string
The filters to use, following PostgREST syntax
options
REQUIRED
object
Named parameters
Details
With `select()`
Use `or` with `and`
Use `or` on referenced tables
const { data, error } = await supabase
  .from('countries')
  .select('name')
  .or('id.eq.2,name.eq.Algeria')

Data source
Response
Match the filter
Match only rows which satisfy the filter. This is an escape hatch - you should use the specific filter methods wherever possible.

filter() expects you to use the raw PostgREST syntax for the filter values.

.filter('id', 'in', '(5,6,7)')  // Use `()` for `in` filter
.filter('arraycol', 'cs', '{"a","b"}')  // Use `cs` for `contains()`, `{}` for array values

Parameters

column
REQUIRED
Union: expand to see options
The column to filter on
Details
operator
REQUIRED
Union: expand to see options
The operator to filter with, following PostgREST syntax
Details
value
REQUIRED
unknown
The value to filter with, following PostgREST syntax
With `select()`
On a referenced table
const { data, error } = await supabase
  .from('countries')
  .select()
  .filter('name', 'in', '("Algeria","Japan")')

Data source
Response
Using modifiers
Filters work on the row level—they allow you to return rows that only match certain conditions without changing the shape of the rows. Modifiers are everything that don't fit that definition—allowing you to change the format of the response (e.g., returning a CSV string).

Modifiers must be specified after filters. Some modifiers only apply for queries that return rows (e.g., select() or rpc() on a function that returns a table response).
Return data after inserting
Perform a SELECT on the query result.
Parameters

columns
Optional
Query
The columns to retrieve, separated by commas
With `upsert()`
const { data, error } = await supabase
  .from('countries')
  .upsert({ id: 1, name: 'Algeria' })
  .select()

Data source
Response
Order the results
Order the query result by column.
Parameters

column
REQUIRED
Union: expand to see options
The column to order by
Details
options
Optional
object
Named parameters
Details
With `select()`
On a referenced table
Order parent table by a referenced table
const { data, error } = await supabase
  .from('countries')
  .select('id', 'name')
  .order('id', { ascending: false })

Data source
Response
Limit the number of rows returned
Limit the query result by count.
Parameters

count
REQUIRED
number
The maximum number of rows to return
options
REQUIRED
object
Named parameters
Details
With `select()`
On a referenced table
const { data, error } = await supabase
  .from('countries')
  .select('name')
  .limit(1)

Data source
Response
Limit the query to a range
Limit the query result by starting at an offset (from) and ending at the offset (from + to). Only records within this range are returned. This respects the query order and if there is no order clause the range could behave unexpectedly. The from and to values are 0-based and inclusive: range(1, 3) will include the second, third and fourth rows of the query.
Parameters

from
REQUIRED
number
The starting index from which to limit the result
to
REQUIRED
number
The last index to which to limit the result
options
REQUIRED
object
Named parameters
Details
With `select()`
const { data, error } = await supabase
  .from('countries')
  .select('name')
  .range(0, 1)

Data source
Response
Set an abort signal
Set the AbortSignal for the fetch request.

You can use this to set a timeout for the request.
Parameters

signal
REQUIRED
AbortSignal
The AbortSignal to use for the fetch request
Aborting requests in-flight
Set a timeout
const ac = new AbortController()
ac.abort()
const { data, error } = await supabase
  .from('very_big_table')
  .select()
  .abortSignal(ac.signal)

Response
Notes
Retrieve one row of data
Return data as a single object instead of an array of objects.
With `select()`
const { data, error } = await supabase
  .from('countries')
  .select('name')
  .limit(1)
  .single()

Data source
Response
Retrieve zero or one row of data
Return data as a single object instead of an array of objects.
Return Type

Union: expand to see options
Details
With `select()`
const { data, error } = await supabase
  .from('countries')
  .select()
  .eq('name', 'Singapore')
  .maybeSingle()

Data source
Response
Retrieve as a CSV
Return data as a string in CSV format.
Return Type

string
Return data as CSV
const { data, error } = await supabase
  .from('countries')
  .select()
  .csv()

Data source
Response
Notes
Override type of successful response
Override the type of the returned data.
Override type of successful response
const { data } = await supabase
  .from('countries')
  .select()
  .returns<MyType>()

Response
Using explain



REALTIME:

Subscribe to channel
Creates an event handler that listens to changes.

By default, Broadcast and Presence are enabled for all projects.
By default, listening to database changes is disabled for new projects due to database performance and security concerns. You can turn it on by managing Realtime's replication.
You can receive the "previous" data for updates and deletes by setting the table's REPLICA IDENTITY to FULL (e.g., ALTER TABLE your_table REPLICA IDENTITY FULL;).
Row level security is not applied to delete statements. When RLS is enabled and replica identity is set to full, only the primary key is sent to clients.
Parameters

type
REQUIRED
Union: expand to see options
Details
filter
REQUIRED
Union: expand to see options
Details
callback
REQUIRED
function
Details
Listen to broadcast messages
Listen to presence sync
Listen to presence join
Listen to presence leave
Listen to all database changes
Listen to a specific table
Listen to inserts
Listen to updates
Listen to deletes
Listen to multiple events
Listen to row level changes
const channel = supabase.channel("room1")

channel.on("broadcast", { event: "cursor-pos" }, (payload) => {
  console.log("Cursor position received!", payload);
}).subscribe((status) => {
  if (status === "SUBSCRIBED") {
    channel.send({
      type: "broadcast",
      event: "cursor-pos",
      payload: { x: Math.random(), y: Math.random() },
    });
  }
});

Unsubscribe from a channel
Unsubscribes and removes Realtime channel from Realtime client.

Removing a channel is a great way to maintain the performance of your project's Realtime service as well as your database if you're listening to Postgres changes. Supabase will automatically handle cleanup 30 seconds after a client is disconnected, but unused channels may cause degradation as more clients are simultaneously subscribed.
Parameters

channel
REQUIRED
@supabase/realtime-js.RealtimeChannel
The name of the Realtime channel.
Return Type

Promise<Union: expand to see options>
Details
Removes a channel
supabase.removeChannel(myChannel)

Unsubscribe from all channels
Unsubscribes and removes all Realtime channels from Realtime client.

Removing channels is a great way to maintain the performance of your project's Realtime service as well as your database if you're listening to Postgres changes. Supabase will automatically handle cleanup 30 seconds after a client is disconnected, but unused channels may cause degradation as more clients are simultaneously subscribed.
Return Type

Promise<Array<Union: expand to see options>>
Details
Remove all channels
supabase.removeAllChannels()

Retrieve all channels
Returns all Realtime channels.
Return Type

Array<@supabase/realtime-js.RealtimeChannel>
Get all channels
const channels = supabase.getChannels()

Broadcast a message
Sends a message into the channel.

Broadcast a message to all connected clients to a channel.

When using REST you don't need to subscribe to the channel
REST calls are only available from 2.37.0 onwards
Parameters

args
REQUIRED
object
Arguments to send to channel
Details
opts
REQUIRED
{ [key: string]: any }
Options to be used during the send process
Return Type

Promise<Union: expand to see options>
Details

supabase
  .channel('room1')
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      channel.send({
        type: 'broadcast',
        event: 'cursor-pos',
        payload: { x: Math.random(), y: Math.random() },
      })
    }
  })

