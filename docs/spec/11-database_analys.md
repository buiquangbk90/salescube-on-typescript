Using the existing reverse-engineering reports, perform a deep database analysis.

Focus on discovering the actual data model from:
- migrations
- ORM entities
- schema files
- SQL queries
- repository classes
- joins
- foreign key patterns
- validation rules

Create:

1. output/database/table-dictionary.md
2. output/database/relationship-map.md
3. output/database/suspected-erd.mmd
4. output/database/data-lifecycle.md
5. output/database/data-integrity-risks.md

For every table, document:
- probable primary key
- foreign keys
- fields frequently used for search
- fields used as status flags
- soft-delete fields
- audit fields
- likely business meaning
- source evidence

Do not create a new database design yet.