import { ICommonObject, IMessage, INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { ConversationChain } from 'langchain/chains'
import { BaseLanguageModel } from 'langchain/base_language'
import { BaseChatMemory, ChatMessageHistory } from 'langchain/memory'
import { AIChatMessage, HumanChatMessage } from 'langchain/schema'
import { ChatPromptTemplate, MessagesPlaceholder } from 'langchain/prompts'

class ConversationChain_Chains implements INode {
    label: string
    name: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    description: string
    inputs: INodeParams[]
    outputs: INodeOutputsValue[]

    constructor() {
        this.label = 'Conversation Chain'
        this.name = 'conversationChain'
        this.type = 'ConversationChain'
        this.icon = 'chain.svg'
        this.category = 'Chains'
        this.description = 'Conversational chain to run queries against LLMs with chat memory'
        this.baseClasses = [this.type, ...getBaseClasses(ConversationChain)]
        this.inputs = [
            {
                label: 'Language Model',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: 'Memory',
                name: 'memory',
                type: 'BaseChatMemory'
            },
            {
                label: 'Prompt',
                name: 'prompt',
                type: 'ChatPromptTemplate'
            },
            {
                label: 'Chain Name',
                name: 'chainName',
                type: 'string',
                placeholder: 'Name Your Chain',
                optional: true
            }
        ]
        this.outputs = [
            {
                label: 'LLM Chain',
                name: 'conversationChain',
                baseClasses: [this.type, ...getBaseClasses(ConversationChain)]
            },
            {
                label: 'Output Prediction',
                name: 'outputPrediction',
                baseClasses: ['string']
            }
        ]
    }

    async init(nodeData: INodeData, input: string, options: ICommonObject): Promise<any> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        const prompt = nodeData.inputs?.prompt as ChatPromptTemplate
        const promptData = nodeData.inputs?.prompt
        const output = nodeData.outputs?.output as string
        const promptValues = promptData.promptValues as ICommonObject
        const memoryData = nodeData.inputs?.memory
        const memory = nodeData.inputs?.memory as BaseChatMemory

        if (memoryData.memoryKey) {
            prompt.promptMessages.unshift(new MessagesPlaceholder(memoryData.memoryKey))
        }

        if (output === this.name) {
            return new ConversationChain({ memory: memory, llm: model, prompt: prompt })
        } else if (output === 'outputPrediction') {
            const chain = new ConversationChain({ llm: model, memory: memory, prompt: prompt })
            const inputVariables = chain.prompt.inputVariables as string[] // ["product"]
            const res = await runPrediction(inputVariables, chain, input, promptValues, options)
            // eslint-disable-next-line no-console
            console.log('\x1b[92m\x1b[1m\n*****OUTPUT PREDICTION*****\n\x1b[0m\x1b[0m')
            // eslint-disable-next-line no-console
            console.log(res)
            return res
        }
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string> {
        const inputVariables = nodeData.instance.prompt.inputVariables as string[] // ["product"]
        const chain = nodeData.instance as ConversationChain
        const promptValues = nodeData.inputs?.prompt.promptValues as ICommonObject

        const res = await runPrediction(inputVariables, chain, input, promptValues, options)
        // eslint-disable-next-line no-console
        console.log('\x1b[93m\x1b[1m\n*****FINAL RESULT*****\n\x1b[0m\x1b[0m')
        // eslint-disable-next-line no-console
        console.log(res)
        return res
    }
}

const runPrediction = async (
    inputVariables: string[],
    chain: ConversationChain,
    input: string,
    promptValues: ICommonObject,
    options: ICommonObject
) => {
    if (options && options.chatHistory) {
        const chatHistory = []
        const histories: IMessage[] = options.chatHistory
        const memory = chain.memory as BaseChatMemory

        for (const message of histories) {
            if (message.type === 'apiMessage') {
                chatHistory.push(new AIChatMessage(message.message))
            } else if (message.type === 'userMessage') {
                chatHistory.push(new HumanChatMessage(message.message))
            }
        }
        memory.chatHistory = new ChatMessageHistory(chatHistory)
    }

    if (inputVariables.length === 1) {
        return await chain.run(input)
    } else if (inputVariables.length > 1) {
        let seen: string[] = []

        for (const variable of inputVariables) {
            seen.push(variable)
            if (promptValues[variable]) {
                seen.pop()
            }
        }

        if (seen.length === 0) {
            // All inputVariables have fixed values specified
            const options = {
                ...promptValues
            }
            const res = await chain.call(options)
            return res?.text
        } else if (seen.length === 1) {
            // If one inputVariable is not specify, use input (user's question) as value
            const lastValue = seen.pop()
            if (!lastValue) throw new Error('Please provide Prompt Values')
            const options = {
                ...promptValues,
                [lastValue]: input
            }
            const res = await chain.call(options)
            return res?.text
        } else {
            throw new Error(`Please provide Prompt Values for: ${seen.join(', ')}`)
        }
    } else {
        return await chain.run(input)
    }
}

module.exports = { nodeClass: ConversationChain_Chains }
