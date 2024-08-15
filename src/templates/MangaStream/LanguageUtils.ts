export function convertDate(rawDate: string, source: any) {
    const dateString: string = rawDate.toLowerCase()
    const monthObject = source.dateMonths

    let date: any = null
    for (const typeOfTime in monthObject) {
        if (dateString.includes(monthObject[typeOfTime].toLowerCase())) {
            date = dateString.replace(monthObject[typeOfTime].toLowerCase(), typeOfTime.toLowerCase())
        }
    }

    if (!date || String(date) == 'Invalid Date') throw new Error('Failed to parse chapter date! TO DEV: Please check if the entered months reflect the sites months')
    return new Date(date)
}