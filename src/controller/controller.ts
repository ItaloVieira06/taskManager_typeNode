import { TaskFilter } from "../dto/filter-task.dto";
import { TasksDTO } from "../dto/task.dto";
import { database } from "../models/database";

export class TaskManager {
    private database = new database();

    async createTasks(name: string, description: string): Promise<TasksDTO> {

        //checar se os valores inseridos são válidos
        if (!name || typeof name !== "string" || name.trim() === "") {
            throw new Error('Name e/ou description são obrigatórios.');
        }
        if (!description || typeof description !== "string" || description.trim() === "") {
            throw new Error('Name e/ou  description são obrigatórios.');
        }

        //criação da tarefa
        return this.database.insert({
            "tasks",
            data: { name, description }
        });
    }

    async searchTasks(filter: TaskFilter): Promise<TaskFilter[]> {
        const { id, name, description } = filter;
        //checa se o filtro, e somente um, foi utilizado
        const filtersUsed = [id, name, description].filter(v => v !== undefined);

        if (filtersUsed.length > 1) {
            throw new Error("Utilize um, e somente um, filtro para pesquisar. Opções: id, name, description.");
        }

        if (filtersUsed.length <= 0) {
            return this.prisma.task.findMany();
        }

        // Busca por ID
        if (id !== undefined) {
            const task = await this.prisma.task.findUnique({ where: { id } });
            return task ? [task] : [];
        }

        // Busca por nome
        if (name !== undefined) {
            return this.prisma.task.findMany({
                where: {
                    name: {
                        contains: name as string
                    },
                },
            });
        }

        if (description !== undefined) {
            return this.prisma.task.findMany({
                where: {
                    description: {
                        contains: description as string
                    },
                },
            });
        }

        return [];
    }

    async updateTasks(id: string, updates: Partial<{ name: string; description: string; completed: boolean }>): Promise<TasksDTO> {
        //checar se id foi inserido
        if (!id || typeof id !== "string" || id.trim() === "") {
            throw new Error('Por favor, insira o valor do ID.');
        }

        //checar se a tarefa existe
        const exists = await this.prisma.task.findUnique({ where: { id } });
        if (!exists) {
            throw new Error('Tarefa não encontrada.');
        }

        //montar corpo para atualizar
        const data: Partial<{
            name: string;
            description: string;
            completed: boolean;
        }> = {};

        //checar name
        if (updates.name !== undefined) {
            if (typeof updates.name === "string") {
                data.name = updates.name;
            } else {
                throw new Error("O campo 'name' deve ser uma string.");
            }
        }

        //checar description
        if (updates.description !== undefined) {
            if (typeof updates.description === "string") {
                data.description = updates.description;
            } else {
                throw new Error("O campo 'description' deve ser uma string.");
            }
        }

        //checar isClosed
        if (updates.completed !== undefined) {
            if (typeof updates.completed === "boolean") {
                data.completed = updates.completed;
            } else {
                throw new Error("O campo 'isClosed' deve ser booleano.");
            }
        }

        //checar se alguma informação foi inserida para atualização
        if (Object.keys(data).length === 0) {
            throw new Error("Nenhum campo válido para atualizar.");
        }

        //atualizar com as informações inseridas no corpo de atualização
        const updatedTask = await this.prisma.task.update({
            where: { id },
            data,
        });

        return updatedTask;
    }

    async deleteTasks(id: string): Promise<boolean> {
        //checar se o id inserido é valido ou se foi inserido
        if (!id || typeof id !== "string" || id.trim() === "") {
            throw new Error('Por favor, insira o valor do ID.');
        }

        //procura pela tarefa no banco
        const exists = await this.prisma.task.findUnique({ where: { id } });

        //retorno caso não encontre
        if (!exists) {
            throw new Error('A tarefa não foi encontrada.');
        }

        //retorno caso encontre, deletando a tarefa
        await this.prisma.task.delete({ where: { id } });
        return true;
    }
}

export const taskManager = new TaskManager();