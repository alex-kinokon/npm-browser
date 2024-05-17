import { cx } from "@emotion/css"
import { type FunctionComponent, forwardRef } from "react"

interface WithClassName<P = object> extends FunctionComponent<P> {
  className: string
}

export const classed: {
  (
    type: "input",
    className: string | string[],
  ): WithClassName<
    React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
  >
  <K extends keyof JSX.IntrinsicElements>(
    type: K,
    className: string | string[],
  ): WithClassName<JSX.IntrinsicElements[K]>
  (
    type: string,
    className: string | string[],
  ): WithClassName<React.ClassAttributes<any> & React.DOMAttributes<any>>
  <P>(type: FunctionComponent<P>, className: string | string[]): WithClassName<P>
  <P>(type: React.ComponentClass<P>, className: string | string[]): WithClassName<P>
} = (Component: any, classNameInput: string | string[]) => {
  const className = cx(classNameInput)
  const component: any = forwardRef<any, any>(({ className: cls, ...props }, ref) => (
    <Component {...props} ref={ref} className={cx(className, cls)} />
  ))
  component.className = className
  return component
}
