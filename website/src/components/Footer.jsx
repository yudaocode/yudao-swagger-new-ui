import { Link } from 'react-router-dom'
import './Footer.scss'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <svg className="footer-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
              </svg>
              <span className="footer-logo-text">NEW UI</span>
            </div>
            <p className="footer-tagline">Beautiful Swagger UI for Spring Boot</p>
          </div>

          <div className="footer-cols">
            <div className="footer-col">
              <h4 className="footer-col-head">resources</h4>
              <Link to="/docs" className="footer-link">docs</Link>
              <a href="https://github.com/yudaocode/yudao-swagger-new-ui" className="footer-link" target="_blank" rel="noopener noreferrer">github</a>
              <a href="https://atomgit.com/yudaocode/yudao-swagger-new-ui" className="footer-link" target="_blank" rel="noopener noreferrer">atomgit</a>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-head">examples</h4>
              <a href="https://github.com/yudaocode/yudao-swagger-new-ui/tree/main/examples/yudao-swagger-ui-spring-boot2-example" className="footer-link" target="_blank" rel="noopener noreferrer">boot 2.x</a>
              <a href="https://github.com/yudaocode/yudao-swagger-new-ui/tree/main/examples/yudao-swagger-ui-spring-boot3-example" className="footer-link" target="_blank" rel="noopener noreferrer">boot 3.x</a>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-head">community</h4>
              <a href="https://github.com/yudaocode/yudao-swagger-new-ui/issues" className="footer-link" target="_blank" rel="noopener noreferrer">issues</a>
              <a href="https://github.com/yudaocode/yudao-swagger-new-ui/pulls" className="footer-link" target="_blank" rel="noopener noreferrer">pull requests</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">MIT License</span>
          <span className="footer-built">Built with React + SCSS</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
