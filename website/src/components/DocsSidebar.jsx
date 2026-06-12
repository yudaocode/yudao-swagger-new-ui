import './DocsSidebar.scss'

function DocsSidebar({ sections, activeSection, onSelect }) {
  const handleClick = (id) => {
    onSelect(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <aside className="docs-sidebar">
      <div className="docs-sidebar-inner">
        <div className="sidebar-section-label">// documentation</div>
        <nav className="sidebar-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`sidebar-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => handleClick(section.id)}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default DocsSidebar
