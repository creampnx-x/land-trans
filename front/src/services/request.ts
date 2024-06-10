import { request } from "@umijs/max";


export function getLand(landId: string) {
    return request('http://localhost:8080/land/' + landId, {
        method: 'Get'
    })
}

export function getLandListByKey(params: {
    key: string
    value: string
}) {
    return request('http://localhost:8080/land', {
        method: 'Get',
        params
    })
}

export function getAllLandList() {
    return request('http://localhost:8080/land', {
        method: 'Get',
        params: {
            key: 'all',
            value: ''
        }
    })
}

export function createLand(data: any) {
    return request('http://localhost:8080/land/create', {
        method: 'Post',
        data
    })
}

export function UpdateLand(data: {
    landId: string
    key: string
    value: string
}) {
    return request('http://localhost:8080/land/update', {
        method: 'POST',
        data
    })
}


export function getTransaction(transactionId: string) {
    return request('http://localhost:8080/land/tran/' + transactionId, {
        method: 'Get'
    })
}

export function getTransactionListByKey(params: {
    key: string
    value: string
}) {
    return request('http://localhost:8080/land/tran', {
        method: 'Get',
        params
    })
}

export function getAllTransactionList() {
    return request('http://localhost:8080/land/tran', {
        method: 'Get',
        params: {
            key: 'status',
            value: '0'
        }
    })
}

export function createTransaction(data: any) {
    return request('http://localhost:8080/land/tran/create', {
        method: 'Post',
        data
    })
}

export function UpdateTransaction(data: {
    transactionId: string
    status: string,
    requester: string,
    validar: string,
}) {
    return request('http://localhost:8080/land/tran/valid', {
        method: 'Post',
        data
    })
}

export function UpdateFile(data: FormData) {
    return request('http://localhost:8080/land/file', {
        method: 'Post',
        data
    })
}