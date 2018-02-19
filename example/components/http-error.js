const HTTPError = ({ status, statusText }) => (
  <aside>
    <h1>Error: {status}</h1>
    <p>{statusText}</p>
  </aside>
)

export default HTTPError
