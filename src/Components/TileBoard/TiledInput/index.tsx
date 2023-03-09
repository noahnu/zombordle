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
            target.setSelectionRange(0, target.value.length)

            if (e.key === KEYS.Backspace) {
                e.preventDefault()

                const prevElement =
                    index > 0 && index < valueWithCorrectLength.length
                        ? target.parentElement?.parentElement?.children[
                              index - 1
                          ]?.firstChild
                        : null

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
