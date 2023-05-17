import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'

import { Dialog, DialogActions, DialogContent, Typography, DialogTitle } from '@mui/material'
import { StyledButton } from 'ui-component/button/StyledButton'

const { REACT_APP_TELEGRAM_BOT_ID } = process.env

const LoginDialog = ({ show, dialogProps }) => {
    const portalElement = document.getElementById('portal')

    const component = show ? (
        <Dialog open={show} fullWidth maxWidth='xs' aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
            <DialogTitle sx={{ fontSize: '1rem' }} id='alert-dialog-title'>
                {dialogProps.title}
            </DialogTitle>
            <DialogContent>
                <Typography>Sign in using your Telegram account</Typography>
            </DialogContent>
            <DialogActions>
                <StyledButton
                    variant='contained'
                    href={`https://t.me/${REACT_APP_TELEGRAM_BOT_ID}?start=token${dialogProps.token}`}
                    target={'_blank'}
                >
                    {dialogProps.confirmButtonName}
                </StyledButton>
            </DialogActions>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

LoginDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onConfirm: PropTypes.func
}

export default LoginDialog
