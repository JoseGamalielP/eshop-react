function ErrorMessage({ message }) {
  return (
    <div className="state-message error-message" role="alert">
      {message}
    </div>
  )
}

export default ErrorMessage
