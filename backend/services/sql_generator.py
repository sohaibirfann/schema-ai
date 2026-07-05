from fastapi import HTTPException
from models.schema import TableSchema, SQLSchemaResponse

# the one thing that's genuinely different across these three - each keyword only works in its own dialect
DIALECT_AUTOINCREMENT = {
    "postgres": "SERIAL PRIMARY KEY",
    "mysql": "INT AUTO_INCREMENT PRIMARY KEY",
    "sqlite": "INTEGER PRIMARY KEY AUTOINCREMENT",
}

def validate_schema(schema_response: SQLSchemaResponse) -> None:
    table_names = [t.table_name for t in schema_response.tables]
    dupe_tables = {n for n in table_names if table_names.count(n) > 1}
    if dupe_tables:
        raise HTTPException(status_code=422, detail=f"Duplicate table name(s): {', '.join(sorted(dupe_tables))}")

    for table in schema_response.tables:
        col_names = [c.name for c in table.columns]
        dupe_cols = {n for n in col_names if col_names.count(n) > 1}
        if dupe_cols:
            raise HTTPException(status_code=422, detail=f"Table '{table.table_name}' has duplicate column name(s): {', '.join(sorted(dupe_cols))}")

    columns_by_table = {t.table_name: {c.name for c in t.columns} for t in schema_response.tables}
    for table in schema_response.tables:
        for col in table.columns:
            ref = col.references
            if ref and ref.column not in columns_by_table.get(ref.table, set()):
                raise HTTPException(status_code=422, detail=f"Column '{table.table_name}.{col.name}' references unknown column '{ref.table}.{ref.column}'")

def generate_create_table_sql(table: TableSchema, dialect: str = "postgres") -> str:
    lines = []
    for col in table.columns:
        if col.auto_increment:
            col_line = f"    {col.name} {DIALECT_AUTOINCREMENT[dialect]}"
            extra = [c for c in col.constraints if c.upper() != "PRIMARY KEY"]
            if extra:
                col_line += " " + " ".join(extra)
        else:
            col_line = f"    {col.name} {col.type}"
            if col.constraints:
                col_line += " " + " ".join(col.constraints)
        if col.references:
            col_line += f" REFERENCES {col.references.table}({col.references.column})"
        lines.append(col_line)

    columns_str = ",\n".join(lines)
    return f"CREATE TABLE {table.table_name} (\n{columns_str}\n);"

def generate_inserts_sql(table: TableSchema) -> str:
    if not table.seed_inserts:
        return ""
    return "\n".join(table.seed_inserts)

def populate_sql_statements(schema_response: SQLSchemaResponse, dialect: str = "postgres") -> SQLSchemaResponse:
    validate_schema(schema_response)
    for table in schema_response.tables:
        table.create_table_sql = generate_create_table_sql(table, dialect)
        table.inserts_sql = generate_inserts_sql(table)
    return schema_response
