import { createApiService } from './apiFactory.js'

const exampleService = createApiService('/example')

export async function loadExample() {
    try {
        const example = await exampleService.getAll()
        console.log(example)
        return example
    } catch (error) {
        console.error('Could not load examples: ', error)
        throw error
    }
}
