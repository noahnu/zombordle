import { useCallback, useEffect, useMemo, useRef } from 'react'

import InputTile from '../Tile/InputTile'

import { InputTileContainer, TileInputGroup } from './TiledInput.styles'

export type TiledInputProps = {
    length: number
    value: string
    onChange: (value: string) => void
    onSubmit: () => void
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

    useEffect(() => {
        firstElementRef.current?.focus()
    }, [])

    const valueWithCorrectLength = useMemo(
        () => value.concat(' '.repeat(length - (value.length || 0))),
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
    const handleKeyUp = useCallback(
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

                updateValue(' ', index, prevElement)
            } else if (e.key === KEYS.Enter) {
                onSubmit()
                firstElementRef.current?.focus()
            }
        },
        [onSubmit, updateValue, valueWithCorrectLength.length],
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
                            value={letter === ' ' ? '' : letter}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ): void => void handleOnChange(e, index)}
                            onKeyUp={(
                                e: React.KeyboardEvent<HTMLInputElement>,
                            ) => void handleKeyUp(e, index)}
                            onFocus={handleOnFocus}
                        />
                    </InputTileContainer>
                )
            })
    }, [valueWithCorrectLength, handleOnFocus, handleOnChange, handleKeyUp])

    return <TileInputGroup role="list">{tiledBlank}</TileInputGroup>
}

export default TiledInput
