const ErrorMessage = ({ heading, children }) => (
  <aside>
    <h1>{heading}</h1>
    {children}
    <style jsx>{`
      aside {
        border-left: 2px solid;
        padding-left: 0.85em;
        font-size: 90%;
        color: #e10098;
      }
    `}</style>
  </aside>
)

export default ErrorMessage
