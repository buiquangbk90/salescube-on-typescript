Identify all business workflows that can be proven or reasonably inferred from the source code.

For each workflow, create a separate Markdown file under:

output/workflows/

Each workflow document must contain:
- Workflow name
- Entry route, command, or batch trigger
- User role if detectable
- Main code path
- Controllers/services/models involved
- Database tables read and written
- Validation rules
- Status transitions
- External integrations
- Error handling
- Evidence file paths and line ranges
- Confidence level

Prioritize workflows related to:
- customer management
- sales/order processing
- contract management
- billing/invoice
- payment
- reporting/export
- user/permission management