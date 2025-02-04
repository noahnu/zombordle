import { useMemo } from 'react'

import { type WordListLength, useWordList } from '../useWordList'

const BASE_DATE = new Date(2023, 6, 4, 0, 0, 0, 0)

export const getDateDifference = () => {
    const today = new Date()
    today.setDate(today.getDate() + 1)

    const difference =
        BASE_DATE.setHours(0, 0, 0, 0) - new Date(today).setHours(0, 0, 0, 0)

    return Math.floor(difference / 864e5)
}

export const useWord = (wordListLength?: WordListLength) => {
    const wordList = useWordList(wordListLength)
    const seed = getDateDifference()
    const index = seed % wordList.length

    return useMemo(
        () => ({ correctWord: wordList[index], wordList }),
        [index, wordList],
    )
}
