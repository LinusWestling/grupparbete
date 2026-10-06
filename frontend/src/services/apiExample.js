import { createApiService } from "./apiFactory";

const exampleService = createApiService('/your-endpoint')

export async function loadExample() {
    try {
        const example = await exampleService.getAll()
        console.log(example)
        return exercises
    } catch (error) {
        console.error('Could not load examples: ', error)
        throw error
    }
}