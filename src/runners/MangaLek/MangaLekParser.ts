import {
    Parser
} from '../../templates/Madara/MadaraParser'

export class MangaLekParser extends Parser {

    override parseDate = (date: string): Date => {
        date = date.toUpperCase()
        let time: Date
        const number = Number((/\d*/.exec(date) ?? [])[0])
        if (date.includes('قبل ساعة') || date.includes('الان') || date.includes('ألان')) {
            time = new Date(Date.now())
        } else if (date.includes('سنة') || date.includes('سنوات') || date.includes('سنوأت')) {
            time = new Date(Date.now() - (number * 31556952000))
        } else if (date.includes('شهر') || date.includes('شهور')) {
            time = new Date(Date.now() - (number * 2592000000))
        } else if (date.includes('اسبوع') || date.includes('اسوبيعن') || date.includes('اسابيع') || date.includes('أسبوع') || date.includes('أسابيع')) {
            time = new Date(Date.now() - (number * 604800000))
        } else if (date.includes('أسوبيعن')) {
            time = new Date(Date.now() - (2 * 604800000))
        } else if (date.includes('يومين')) {
            time = new Date(Date.now() - (2 * 86400000))
        } else if (date.includes('يوم واحد') || date.includes('يوم وأحد')) {
            time = new Date(Date.now() - (1 * 86400000))
        } else if (date.includes('يوم') || date.includes('ايام') || date.includes('أيام')) {
            time = new Date(Date.now() - (number * 86400000))
        } else if (date.includes('ساعة') || date.includes('ساعه') || date.includes('ساعات')) {
            time = new Date(Date.now() - (number * 3600000))
        } else if (date.includes('ساعة واحدة') || date.includes('ساعة وأحدة')) {
            time = new Date(Date.now() - (1 * 3600000))
        } else if (date.includes('دقيقية') || date.includes('دقائق')) {
            time = new Date(Date.now() - (number * 60000))
        } else if (date.includes('ثانية') || date.includes('ثانيا') || date.includes('ثواني') || date.includes('ثوأني')) {
            time = new Date(Date.now() - (number * 1000))
        } else {
            date = date.replace(/يناير/gi, 'January').replace(/فبراير/gi, 'February').replace(/مارس/gi, 'March').replace(/ابريل+|أبريل/gi, 'April').replace(/مايو/gi, 'May').replace(/يونيو/gi, 'June').replace(/يوليو/gi, 'July').replace(/أغسطس+|اغسطس/gi, 'August').replace(/سبتمبر/gi, 'September').replace(/أكتوبر+|اكتوبر/gi, 'October').replace(/نوفمبر/gi, 'November').replace(/ديسمبر/gi, 'December')
            time = new Date(date)
        }
        return time
    }
}