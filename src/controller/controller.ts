import { TasksDTO } from "../dto/task.dto";
import { TaskQuery } from "../dto/query-task.dto";
import { TaskUpdateData } from "../dto/update-task.dto";
import { Database } from "../models/database";
import { Request, Response } from 'express'

const database = new Database();


//Criar
export const createTask = (req: Request<{}, any, TasksDTO>, res: Response) => {
    const { name, description } = req.body

    //Checar valores a serem inseridos
    if (typeof name !== 'string' || typeof description !== 'string') {
        return res.status(400).send('Valores inválidos')
    }
    if (name.trim() === '' || description.trim() === '') {
        return res.status(400).send('Os valores estão em branco, por favor, digite eles.')
    }

    const newTask: TasksDTO = {
        id: crypto.randomUUID(),
        name,
        description,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    //database.insert('tasks', newTask)
    return res.status(201).json(newTask)
}

//Pesquisar
export const searchTask = (req: Request<{}, any, any, TaskQuery>, res: Response) => {
    const { id, name, description } = req.query

    //Checar número de filtros
    const filledParams = [id, name, description].filter((v) => v !== undefined)
    if (filledParams.length > 1) {
        return res
            .status(400)
            .send('Para pesquisas com filtros, utilize um (e apenas um) filtro de pesquisa!')
    }

    //Função auxiliar para pesquisa
    const doFilter = (filterKey: 'id' | 'name' | 'content', value: string) => {
        const tasks = database.select('tasks', { [filterKey]: value })
        if (tasks.length === 0) {
            return res.status(404).send('Nada foi encontrado')
        }
        return res.json(tasks)
    }

    //checagem para inserção
    if (id) {
        return doFilter('id', id)
    }

    if (name) {
        return doFilter('name', name)
    }

    if (description) {
        return doFilter('content', description)
    }

    //sem filtros ele retorna todas as tarefas
    const allTasks = database.select('tasks', {})
    if (allTasks.length === 0) {
        return res.status(404).send('Nada foi encontrado')
    }
    return res.json(allTasks)
}

//Editar
export const updateTask = (req: Request<{}, any, TaskUpdateData, { id?: string }>, res: Response) => {
        const { id } = req.query
        const { name, description, completed } = req.body

        if (!id) {
            return res
                .status(400)
                .send('Por favor, insira o id da tarefa a ser editada nos parâmetros!')
        }

        const tasks = database.select('tasks', { id })
        if (tasks.length === 0) {
            return res
                .status(404)
                .send('A tarefa a ser editada na tabela não existe')
        }

        //Checar se os campos são vazios
        if (
            name === undefined &&
            description === undefined &&
            completed === undefined
        ) {
            return res.status(400).send('Não insira valores vazios')
        }

        //Checagem de tipo
        if (description !== undefined && typeof description !== 'string') {
            return res.status(400).send('Valores inválidos para content')
        }
        if (name !== undefined && typeof name !== 'string') {
            return res.status(400).send('Valores inválidos para name')
        }
        if (completed !== undefined && typeof completed !== 'boolean') {
            return res.status(400).send('Valores inválidos para isClosed')
        }

        //Criação do objeto para atualização
        const updatePayload: Partial<TasksDTO> = {
            updatedAt: new Date(),
        }
        if (completed !== undefined) {
            updatePayload.completed = completed
        }
        if (name !== undefined && name.trim() !== '') {
            updatePayload.name = name.trim()
        }
        if (description !== undefined && description.trim() !== '') {
            updatePayload.description = description.trim()
        }

        const updated = database.update('tasks', id, updatePayload)
        return res.json(updated)
    }

//Deletar
export const deleteTask = (req: Request<{}, any, any, { id?: string }>, res: Response) => {
        const { id } = req.query

        //checar se o id é valido
        if (!id) {
            return res
                .status(400)
                .send('Por favor, insira o id da tarefa a ser deletada nos parâmetros!')
        }

        //checar se a tarefa existe
        const tasks = database.select('tasks', { id })
        if (tasks.length === 0) {
            return res
                .status(404)
                .send('A Tarefa a ser deletada na tabela não existe')
        }

        //deletar
        database.delete('tasks', id)
        return res.send(`Tarefa deletada: ${id}`)
    }