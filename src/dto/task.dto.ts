export interface TasksDTO {
    id: string;
    name: string;
    description: string | null;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}