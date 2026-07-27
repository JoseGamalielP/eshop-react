function LoadingMessage({ message = 'Cargando informacion...' }) {
  return (
    <div className="state-message loading-message" role="status">
      {message}
    </div>
  )
}

export default LoadingMessage
