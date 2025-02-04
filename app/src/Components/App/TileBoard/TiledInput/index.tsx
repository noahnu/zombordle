import { useFormContext } from 'formula-one'
import { useCallback, useEffect, useMemo } from 'react'

import { MAX_ATTEMPTS } from '../../App.constants'

import { InputElement } from './InputElement'
import {
    StyledButton,
    StyledForm,
    StyledLegend,
    TileInputGroup,
} from './TiledInput.styles'
import { useValidationTooltipTracker } from './TiledInputValidation/useValidationTooltipTracker'

const KEYS = {
    Backspace: 'Backspace',
    Enter: 'Enter',
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight',
}

const isInputElement = (
    element: ChildNode | null | undefined,
): element is HTMLInputElement => Boolean(element && 'focus' in element)

export type TiledInputProps = {
    length: number
    guessNumber: number
    isInvalidWord: boolean
    resetInvalidWord: () => void
}

const TiledInput: React.FC<TiledInputProps> = ({
    length,
    guessNumber,
    isInvalidWord,
    resetInvalidWord,
}) => {
    const { getFieldRefs, setFieldValue, getFieldValues, onSubmit } =
        useFormContext()
    const { hoverState, focusState, ...eventHandlers } =
        useValidationTooltipTracker()
    useEffect(() => {
        getFieldRefs()[0]?.current?.focus()
    }, [getFieldRefs])

    const getPrevElement = useCallback(
        (index: number) => {
            const fieldRefs = getFieldRefs()
            return index > 0 && index <= fieldRefs.length
                ? fieldRefs[index - 1].current
                : null
        },
        [getFieldRefs],
    )

    const getNextElement = useCallback(
        (index: number) => {
            const fieldRefs = getFieldRefs()
            return index < fieldRefs.length - 1
                ? fieldRefs[index + 1].current
                : null
        },
        [getFieldRefs],
    )

    const handleOnChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
            if (isInvalidWord) {
                resetInvalidWord()
            }

            getNextElement(index)?.focus()
        },
        [getNextElement, isInvalidWord, resetInvalidWord],
    )

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
            const target = e.target as HTMLInputElement

            target.setSelectionRange(0, target.value.length)
            if (e.key === KEYS.Backspace) {
                e.preventDefault()
                if (!isInputElement(target)) {
                    return
                }
                setFieldValue(target.name, '')
                getPrevElement(index)?.focus()
            } else if (e.key === KEYS.ArrowLeft) {
                getPrevElement(index)?.focus()
            } else if (e.key === KEYS.ArrowRight) {
                getNextElement(index)?.focus()
            } else if (e.key === target.value) {
                // advance the focus even if the onchange
                // isn't fired. Assume if user pressed the same
                // key as is already in the field, that they want
                // to type it and move on to the next field.
                e.preventDefault()
                getNextElement(index)?.focus()
            }
        },
        [getNextElement, getPrevElement, setFieldValue],
    )
    const handleOnFocus = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            const target = e.target
            eventHandlers.onFocus(e)
            target.setSelectionRange(0, target.value.length)
        },
        [eventHandlers],
    )

    const handleGlobalKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey) {
                return
            }

            const fieldRefs = getFieldRefs()
            const inputMap = fieldRefs.map((ref) => ref.current)

            if (
                isInputElement(document.activeElement) &&
                inputMap.includes(document.activeElement)
            )
                return

            if (/^[ -~]$/.test(e.key)) {
                const firstEmptyField = Object.entries(getFieldValues()).find(
                    ([, value]) => !value || value === ' ',
                )

                if (firstEmptyField) {
                    e.preventDefault()
                    const [fieldName] = firstEmptyField
                    setFieldValue(fieldName, e.key)
                    const fieldIndex = fieldRefs.findIndex(
                        (ref) => ref?.current?.name === fieldName,
                    )
                    if (fieldIndex !== -1) {
                        getNextElement(fieldIndex + 1)
                    }
                }
            } else if (e.key === KEYS.Enter) {
                const firstEmptyField = Object.entries(getFieldValues()).find(
                    ([, value]) => !value || value === ' ',
                )

                if (!firstEmptyField) {
                    e.preventDefault()
                    onSubmit()
                }
            } else if (e.key === KEYS.Backspace) {
                const lastInputWithValue = Object.entries(
                    getFieldValues(),
                ).findLast(([, value]) => value && value !== ' ')

                if (lastInputWithValue) {
                    const [fieldName] = lastInputWithValue
                    e.preventDefault()

                    setFieldValue(fieldName, '')
                    const fieldIndex = fieldRefs.findIndex(
                        (ref) => ref?.current?.name === fieldName,
                    )
                    getPrevElement(fieldIndex)?.focus()
                }
            } else if (e.key === KEYS.ArrowLeft) {
                getPrevElement(length)?.focus()
            } else if (e.key === KEYS.ArrowRight) {
                getNextElement(-1)?.focus()
            }
        },
        [
            getFieldRefs,
            getFieldValues,
            getNextElement,
            getPrevElement,
            length,
            onSubmit,
            setFieldValue,
        ],
    )

    useEffect(() => {
        document.addEventListener('keydown', handleGlobalKeyDown)

        return () => {
            document.removeEventListener('keydown', handleGlobalKeyDown)
        }
    }, [handleGlobalKeyDown])

    const handlePaste = useCallback(
        (event: React.ClipboardEvent<HTMLInputElement>) => {
            event.preventDefault()
            const fieldRefs = getFieldRefs()
            const activeInput = fieldRefs.findIndex(
                (ref) => ref.current === document.activeElement,
            )
            let nextActiveInput = activeInput !== -1 ? activeInput : 0

            const pastedData = event.clipboardData
                .getData('text/plain')
                .slice(0, length - activeInput)
                .split('')

            for (let pos = 0; pos < length; ++pos) {
                if (pos >= activeInput && pastedData.length > 0) {
                    const fieldName = fieldRefs[pos]?.current?.name

                    if (fieldName) {
                        setFieldValue(fieldName, pastedData.shift() ?? '')
                    }
                    nextActiveInput++
                }
            }
            fieldRefs[
                nextActiveInput >= length ? length - 1 : nextActiveInput
            ]?.current?.focus()
        },
        [getFieldRefs, length, setFieldValue],
    )

    const tiledInput = useMemo(
        () =>
            new Array(length).fill('').map((_, index: number) => {
                return (
                    <InputElement
                        key={`input-element-${index + 1}`}
                        index={index}
                        wordLength={length}
                        onChange={handleOnChange}
                        onFocus={handleOnFocus}
                        onBlur={eventHandlers.onBlur}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        onMouseEnter={eventHandlers.onMouseEnter}
                        onMouseLeave={eventHandlers.onMouseLeave}
                        hasFocus={focusState.visible}
                        isHovering={hoverState.visible}
                    />
                )
            }),

        [
            length,
            handleOnChange,
            handleOnFocus,
            eventHandlers.onBlur,
            eventHandlers.onMouseEnter,
            eventHandlers.onMouseLeave,
            handleKeyDown,
            handlePaste,
            focusState.visible,
            hoverState.visible,
        ],
    )

    return (
        <StyledForm>
            <TileInputGroup $isInvalid={isInvalidWord}>
                <StyledLegend>
                    Guess {guessNumber} of {MAX_ATTEMPTS}
                </StyledLegend>
                {tiledInput}
            </TileInputGroup>
            {/* Submit button is needed for keyboard submit of form
             * but is currently visually hidden
             */}
            <StyledButton type="submit">Submit</StyledButton>
        </StyledForm>
    )
}

export default TiledInput
