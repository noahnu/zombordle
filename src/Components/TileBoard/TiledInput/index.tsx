import { useCallback, useMemo, useRef } from 'react'

import InputTile from '../Tile/InputTile'

import { InputTileContainer, TileInputGroup } from './TiledInput.styles'

export type TiledInputProps = {
    length: number
    value: string
    onChange: (value: string) => void
    onSubmit: () => void
}

const CHARS = {
    Space: ' ',
}

const KEYS = {
    Backspace: 'Backspace',
    Enter: 'Enter',
}

const toOrdinal = (num: number) => {
    const number = num.toString()
    const lastTwoDigits = Math.abs(num % 100)
    const isBetween11and13 = lastTwoDigits <= 11 && lastTwoDigits >= 13

    if (isBetween11and13) {
        return `${number}th`
    }
    if (number.endsWith('1')) {
        return `${number}st`
    }
    if (number.endsWith('2')) {
        return `${number}nd`
    }
    if (number.endsWith('3')) {
        return `${number}rd`
    }

    return `${number}th`
}

const isInputElement = (
    element: ChildNode | null | undefined,
): element is HTMLInputElement => Boolean(element && 'focus' in element)

const TiledInput: React.FC<TiledInputProps> = ({
    value,
    length,
    onChange,
    onSubmit,
}) => {
    const firstElementRef = useRef<HTMLInputElement>(null)

    const valueWithCorrectLength = useMemo(
        () => value.concat(CHARS.Space.repeat(length - (value.length || 0))),
        [length, value],
    )

    const updateValue = useCallback(
        (
            targetValue: string,
            index: number,
            nextElement?: ChildNode | null,
        ) => {
            const newValue = valueWithCorrectLength
                .substring(0, index)
                .concat(targetValue)
                .concat(valueWithCorrectLength.substring(index + 1))

            onChange(newValue)

            if (targetValue === '') {
                return
            }

            if (isInputElement(nextElement)) {
                nextElement.focus()
            }
        },
        [onChange, valueWithCorrectLength],
    )
    const handleOnChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
            const targetValue = e.target.value
            const nextElement =
                index < valueWithCorrectLength.length
                    ? e.target.parentElement?.parentElement?.children[index + 1]
                          ?.firstChild
                    : null
            updateValue(targetValue, index, nextElement)
        },
        [updateValue, valueWithCorrectLength.length],
    )
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
            const target = e.target as HTMLInputElement
            const prevElement =
                index > 0 && index < valueWithCorrectLength.length
                    ? target.parentElement?.parentElement?.children[index - 1]
                          ?.firstChild
                    : null

            target.setSelectionRange(0, target.value.length)
            if (e.key === KEYS.Backspace) {
                e.preventDefault()

                updateValue(CHARS.Space, index, prevElement)
            } else if (e.key === KEYS.Enter) {
                if (valueWithCorrectLength.includes(CHARS.Space)) {
                    return
                }

                onSubmit()
                firstElementRef.current?.focus()
            }
        },
        [onSubmit, updateValue, valueWithCorrectLength],
    )
    const handleOnFocus = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            const target = e.target

            target.setSelectionRange(0, target.value.length)
        },
        [],
    )
    const tiledBlank = useMemo(() => {
        return valueWithCorrectLength
            .split('')
            .map((letter: string, index: number) => {
                return (
                    <InputTileContainer key={`input-${index + 1}`}>
                        <InputTile
                            ref={index === 0 ? firstElementRef : null}
                            name={`input-${index + 1}`}
                            label={`${toOrdinal(index + 1)} letter`}
                            value={letter === CHARS.Space ? '' : letter}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ): void => void handleOnChange(e, index)}
                            onKeyDown={(
                                e: React.KeyboardEvent<HTMLInputElement>,
                            ) => void handleKeyDown(e, index)}
                            onFocus={handleOnFocus}
                        />
                    </InputTileContainer>
                )
            })
    }, [valueWithCorrectLength, handleOnFocus, handleOnChange, handleKeyDown])

    return <TileInputGroup role="list">{tiledBlank}</TileInputGroup>
}

export default TiledInput
