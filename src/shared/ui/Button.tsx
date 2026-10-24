import type { ButtonHTMLAttributes } from 'react'
import { buttonStyles, type ButtonVariant } from './buttonStyles'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export const Button = ({ variant, className, type = 'button', ...props }: ButtonProps) => (
  <button type={type} className={buttonStyles(variant, className)} {...props} />
)
