import fs from 'node:fs/promises'
import { TaskFilter } from '../dto/filter-task.dto'

//types para auxílio
type TableRow = {
    id: string
    [key: string]: any
}

type DatabaseContent = {
    [tableName: string]: TableRow[]
}

//rota do db
const databasePath = new URL('./db.json', import.meta.url)

//banco de dados na mão
export class Database {
    #database: DatabaseContent = {}

    //criar database
    constructor() {
        fs.readFile(databasePath, 'utf8')
            .then(data => {
                this.#database = JSON.parse(data)
            })
            .catch(() => {
                this.#persist()
            })
    }

    //salvar mudanças do database
    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database, null, 2))
    }

    //inserir tarefa
    public insert(table: string, data: TableRow): TableRow {
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data)
        } else {
            this.#database[table] = [data]
        }

        this.#persist()
        return data
    }

    //selecionar tarefa
    public select(table: string, item?: TaskFilter): TableRow[] {
        let data = this.#database[table] ?? []

        if (item && Object.keys(item).length !== 0) {
            const key = Object.keys(item)[0] as keyof TaskFilter
            const value = item[key]

            if (value) {
                data = data.filter((row) => {
                    return row[key]?.toLowerCase().includes(value.toLowerCase())
                })
            }
        }

        return data
    }

    //atualizar tarefa
    public update(table: string, id: string, data: Partial<TableRow>): Partial<TableRow> {
        const rowIndex = this.#database[table]?.findIndex((row) => row.id === id)

        if (rowIndex !== undefined && rowIndex > -1) {
            const oldData = this.#database[table][rowIndex]
            this.#database[table][rowIndex] = { ...oldData, ...data, id }
            this.#persist()
        }

        return data
    }

    //deletar tarefa
    public delete(table: string, id: string): number | void {
        const rowIndex = this.#database[table]?.findIndex((row) => row.id === id)

        if (rowIndex !== undefined && rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1)
            this.#persist()
        } else {
            return rowIndex ?? -1
        }
    }
}