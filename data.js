 let batchSize = 10
    let timeout = 3000

    const walletsInDB = await getCountByChecker('layerzero')

    if (walletsInDB === wallets.length) {
        batchSize = walletsInDB
        timeout = 0
    }

    const batchCount = Math.ceil(wallets.length / batchSize)
    const walletPromises = []

    for (let i = 0; i < batchCount; i++) {
        const startIndex = i * batchSize
        const endIndex = (i + 1) * batchSize
        const batch = wallets.slice(startIndex, endIndex)

        const promise = new Promise((resolve) => {
            setTimeout(() => {
                resolve(fetchBatch(batch, isExtended))
            }, i * timeout)
        })

        walletPromises.push(promise)
    }

    p = new Table({
        columns: columns,
        sort: (row1, row2) => +row1.n - +row2.n
    })

    return Promise.all(walletPromises)
}

async function saveToCsv() {
    p.table.rows.map((row) => {
        csvData.push(row.text)
    })
    csvData.sort((a, b) => a.n - b.n)
    csvWriter.writeRecords(csvData).then().catch()
}

export async function layerzeroFetchDataAndPrintTable(isExtended = false) {
    progressBar.start(iterations, 0)
    if (isExtended) {
        if (isExtended) {
            sourceNetworks.forEach((source) => {
                headers.push({ id: source, title: source })
                columns.push({ name: source, alignment: 'right', color: 'cyan' })
            })
            protocolsList.forEach((protocol) => {
                if (protocol === 'harmony') {
                    headers.push({ id: protocol+'-bridge', title: protocol+'-bridge' })
                    columns.push({ name: protocol+'-bridge', alignment: 'right', color: 'cyan' })
                } else {
                    headers.push({ id: protocol, title: protocol })
                    columns.push({ name: protocol, alignment: 'right', color: 'cyan' })
                }
            })
        }
    }
    await fetchWallets(isExtended)
    progressBar.stop()

    p.printTable()

    await saveToCsv()
}

export async function layerzeroData() {
    await fetchWallets()
    await saveToCsv()

    return jsonData
