import { StyledLink } from '../Header.styles'

import { ReactComponent as SettingsIcon } from './assets/settings_icon.svg'

export const Settings: React.FC = () => {
    return (
        <StyledLink href="/settings" aria-label="Settings">
            <SettingsIcon aria-hidden="true" />
        </StyledLink>
    )
}
