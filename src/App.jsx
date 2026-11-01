import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUp,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Code2,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Menu,
  Moon,
  Send,
  Sun,
  X,
} from 'lucide-react'
import { personal } from './data/personal'
import { projects } from './data/projects'
import { skillGroups } from './data/skills'
import { timeline } from './data/timeline'
import './App.css'

const revealVariants = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
}

function Reveal({ children, className = '', delay = 0, as = 'div', id }) {
  const Component = motion[as]
  const reduceMotion = useReducedMotion()
  return (
    <Component
      id={id}
      className={className}
      initial={reduceMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
      variants={revealVariants}
      transition={{ duration: reduceMotion ? 0 : 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  )
}

function MagneticLink({ href, children, className, ...props }) {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 20, mass: 0.3 })
  const springY = useSpring(y, { stiffness: 260, damping: 20, mass: 0.3 })

  function move(event) {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - bounds.left - bounds.width / 2) * 0.12)
    y.set((event.clientY - bounds.top - bounds.height / 2) * 0.12)
  }

  function reset() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      href={href}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={move}
      onMouseLeave={reset}
      whileHover={reduceMotion ? undefined : { scale: 1.025 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.a>
  )
}

function RoleTypewriter() {
  const reduceMotion = useReducedMotion()
  const [roleIndex, setRoleIndex] = useState(0)
  const [text, setText] = useState(personal.roles[0])
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (reduceMotion) return undefined

    const role = personal.roles[roleIndex]
    const completed = !deleting && text === role
    const emptied = deleting && text.length === 0
    const timeout = window.setTimeout(
      () => {
        if (completed) {
          setDeleting(true)
        } else if (emptied) {
          setDeleting(false)
          setRoleIndex((current) => (current + 1) % personal.roles.length)
        } else {
          setText((current) =>
            deleting ? current.slice(0, -1) : role.slice(0, current.length + 1),
          )
        }
      },
      completed ? 1400 : deleting ? 45 : 85,
    )

    return () => window.clearTimeout(timeout)
  }, [deleting, reduceMotion, roleIndex, text])

  return (
    <span className="role-text" aria-label={personal.roles[roleIndex]}>
      <span aria-hidden="true">{reduceMotion ? personal.roles[0] : text}</span>
      {!reduceMotion && <span className="typing-caret" aria-hidden="true" />}
    </span>
  )
}

function AnimatedCounter({ value, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.8 })
  const reduceMotion = useReducedMotion()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return undefined
    if (reduceMotion) return undefined

    let frame
    const start = performance.now()
    const duration = 1100
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 4
      setCount(Math.round(value * eased))
      if (progress < 1) frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [inView, reduceMotion, value])

  return <span ref={ref}>{reduceMotion && inView ? value : count}{suffix}</span>
}

function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const reduceMotion = useReducedMotion()
  const scaleX = useSpring(scrollYProgress, { stiffness: 110, damping: 30, restDelta: 0.001 })
  return <motion.div className="reading-progress" style={{ scaleX: reduceMotion ? scrollYProgress : scaleX }} aria-hidden="true" />
}

function SectionTitle({ number, eyebrow, title, description }) {
  return (
    <div className="section-title">
      <p className="eyebrow"><span>{number}</span> / {eyebrow}</p>
      <h2>{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  )
}

function SkillCard({ group, index }) {
  const reduceMotion = useReducedMotion()
  return (
    <Reveal className="skill-card" delay={index * 0.08}>
      <div className="skill-card-heading">
        <span className="skill-card-icon"><Code2 size={19} /></span>
        <div>
          <h3>{group.title}</h3>
          <p>{group.description}</p>
        </div>
      </div>
      <ul className="skill-list">
        {group.skills.map((skill, skillIndex) => (
          <motion.li
            key={skill.name}
            className="skill-item"
            initial={reduceMotion ? false : { opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, delay: skillIndex * 0.07 }}
          >
            <div className="skill-label">
              <span className="skill-name">
                <img
                  src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${skill.icon}/${skill.icon}-original.svg`}
                  alt=""
                  loading="lazy"
                  onError={(event) => { event.currentTarget.hidden = true }}
                />
                {skill.name}
              </span>
              <span className="skill-level">{skill.level}%</span>
            </div>
            <div className="skill-track" role="progressbar" aria-label={`Niveau ${skill.name}`} aria-valuenow={skill.level} aria-valuemin="0" aria-valuemax="100">
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: reduceMotion ? 0 : 0.7, delay: skillIndex * 0.07, ease: 'easeOut' }}
                style={{ transformOrigin: 'left', width: `${skill.level}%`, backgroundColor: skill.color }}
              />
            </div>
          </motion.li>
        ))}
      </ul>
    </Reveal>
  )
}

function ProjectCard({ project, index, onSelect }) {
  const reduceMotion = useReducedMotion()
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springX = useSpring(rotateX, { stiffness: 180, damping: 18 })
  const springY = useSpring(rotateY, { stiffness: 180, damping: 18 })
  const demoAvailable = !project.demo.includes('.example.com')

  function tilt(event) {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    rotateY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 5)
    rotateX.set(((event.clientY - bounds.top) / bounds.height - 0.5) * -5)
  }

  function resetTilt() {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.article
      className="project-card"
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
      transition={{ duration: reduceMotion ? 0 : 0.4, delay: index * 0.05, layout: { duration: 0.3 } }}
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 1000 }}
      onMouseMove={tilt}
      onMouseLeave={resetTilt}
      whileHover={reduceMotion ? undefined : { y: -7, boxShadow: '0 25px 55px rgba(0,0,0,.24)' }}
    >
      <button className="project-image-button" type="button" onClick={() => onSelect(project)} aria-label={`Voir les détails du projet ${project.name}`}>
        <img src={project.image} alt={project.imageAlt} loading="lazy" />
        <span className="project-image-shade" />
        <span className="project-index">0{index + 1} <span>— {project.year}</span></span>
        <span className="project-open"><ArrowRight size={18} /></span>
      </button>
      <div className="project-body">
        <p className="project-subtitle">{project.subtitle}</p>
        <h3>{project.name}</h3>
        <p className="project-description">{project.description}</p>
        <ul className="tag-list" aria-label="Technologies utilisées">
          {project.stack.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
        <div className="project-actions">
          <a href={project.github} target="_blank" rel="noreferrer"><Code2 size={16} /> Code</a>
          {demoAvailable ? (
            <a href={project.demo} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Démo</a>
          ) : (
            <span className="demo-pending" title="Remplacer l’URL par celle de votre démonstration">Démo à renseigner</span>
          )}
          <button type="button" onClick={() => onSelect(project)}>Détails <ChevronRight size={16} /></button>
        </div>
      </div>
    </motion.article>
  )
}

function ProjectDialog({ project, onClose }) {
  const closeRef = useRef(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const previouslyFocused = document.activeElement
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const dialog = document.querySelector('[data-project-dialog]')
        const focusable = dialog?.querySelectorAll('a[href], button:not([disabled])')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  const demoAvailable = !project.demo.includes('.example.com')

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <motion.section
        className="project-modal"
        data-project-dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.99 }}
        transition={{ duration: reduceMotion ? 0 : 0.25 }}
      >
        <button ref={closeRef} className="modal-close icon-button" type="button" aria-label="Fermer les détails" onClick={onClose}><X size={20} /></button>
        <img className="modal-image" src={project.image} alt={project.imageAlt} />
        <div className="modal-content">
          <p className="eyebrow">Projet / {project.year}</p>
          <h2 id="modal-title">{project.name} <span>— {project.subtitle}</span></h2>
          <p className="modal-lead">{project.description}</p>
          <div className="project-detail-grid">
            <div><h3>Problématique</h3><p>{project.problem}</p></div>
            <div><h3>Solution</h3><p>{project.solution}</p></div>
            <div><h3>Mon rôle</h3><p>{project.role}</p></div>
            <div><h3>Défi technique</h3><p>{project.challenges}</p></div>
          </div>
          <ul className="tag-list">{project.stack.map((tag) => <li key={tag}>{tag}</li>)}</ul>
          <div className="modal-actions">
            <a className="button button-secondary" href={project.github} target="_blank" rel="noreferrer"><Code2 size={17} /> Voir le code</a>
            {demoAvailable && <a className="button button-primary" href={project.demo} target="_blank" rel="noreferrer">Ouvrir la démo <ExternalLink size={16} /></a>}
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}

function CvPreviewDialog({ onClose }) {
  const closeRef = useRef(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const previouslyFocused = document.activeElement
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const dialog = document.querySelector('[data-cv-dialog]')
        const focusable = dialog?.querySelectorAll('a[href], button:not([disabled])')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <motion.section
        className="cv-preview-modal"
        data-cv-dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-preview-title"
        initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.99 }}
        transition={{ duration: reduceMotion ? 0 : 0.25 }}
      >
        <header className="cv-preview-header">
          <div>
            <p className="eyebrow">Document / PDF</p>
            <h2 id="cv-preview-title">Aperçu de mon CV</h2>
          </div>
          <button ref={closeRef} className="icon-button cv-preview-close" type="button" aria-label="Fermer l’aperçu du CV" onClick={onClose}><X size={20} /></button>
        </header>
        <iframe className="cv-preview-frame" src={personal.cvUrl} title="Aperçu du CV de Brouhanoudine OMOROU" />
        <div className="cv-preview-actions">
          <a className="button button-primary" href={personal.cvUrl} download="dev-brouhane_cv.pdf"><ArrowDownToLine size={17} /> Télécharger le CV</a>
          <a className="cv-preview-fallback" href={personal.cvUrl} target="_blank" rel="noreferrer">Ouvrir le PDF dans un nouvel onglet</a>
        </div>
      </motion.section>
    </motion.div>
  )
}

function ContactForm() {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  async function submit(event) {
    event.preventDefault()
    setStatus('sending')
    setMessage('')
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    }

    try {
      const response = await fetch(personal.contactEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      let result
      try {
        result = await response.json()
      } catch {
        throw new Error(
          response.ok
            ? 'Le service de contact a renvoyé une réponse invalide.'
            : `Le service de contact est indisponible (HTTP ${response.status}).`,
        )
      }
      if (!result || typeof result.message !== 'string') {
        throw new Error('Le service de contact a renvoyé une réponse inattendue.')
      }
      if (!response.ok) {
        throw new Error(result.message || `Le message n’a pas pu être envoyé (HTTP ${response.status}).`)
      }
      setStatus('success')
      setMessage(result.message || 'Merci ! Ton message a bien été envoyé.')
      form.reset()
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof Error
          ? `${error.message} Tu peux aussi m’écrire directement par e-mail.`
          : 'Une erreur inattendue est survenue. Réessaie ou écris-moi par e-mail.',
      )
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <label>
        <span>Nom</span>
        <input name="name" type="text" autoComplete="name" placeholder="Ton nom" minLength="2" maxLength="100" required />
      </label>
      <label>
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" placeholder="toi@exemple.com" maxLength="254" required />
      </label>
      <label>
        <span>Message</span>
        <textarea name="message" rows="5" placeholder="Parle-moi de ton projet..." minLength="10" maxLength="5000" required />
      </label>
      <div className="form-submit-row">
        <motion.button className="button button-primary" type="submit" disabled={status === 'sending'} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          {status === 'sending' ? <>Envoi en cours <span className="button-spinner" /></> : <>Envoyer le message <Send size={17} /></>}
        </motion.button>
        <p>Réponse sous 48 h</p>
      </div>
      <AnimatePresence mode="wait">
        {message && (
          <motion.p
            key={status}
            className={`form-message ${status}`}
            role={status === 'error' ? 'alert' : 'status'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {status === 'success' ? <Check size={17} /> : null}
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  )
}

function App() {
  const reduceMotion = useReducedMotion()
  const [lightMode, setLightMode] = useState(() => localStorage.getItem('portfolio-theme') === 'light')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeFilter, setActiveFilter] = useState('Tous')
  const [selectedProject, setSelectedProject] = useState(null)
  const [cvPreviewOpen, setCvPreviewOpen] = useState(false)
  const closeProject = useCallback(() => setSelectedProject(null), [])
  const closeCvPreview = useCallback(() => setCvPreviewOpen(false), [])
  const timelineRef = useRef(null)
  const timelineInView = useInView(timelineRef, { once: true, amount: 0.12 })
  const { scrollYProgress: timelineProgress } = useScroll({ target: timelineRef, offset: ['start 75%', 'end 55%'] })
  const { scrollYProgress: pageProgress } = useScroll()
  const timelineScale = useSpring(timelineProgress, { stiffness: 80, damping: 25 })
  const parallaxLeft = useTransform(pageProgress, [0, 1], [0, -110])
  const parallaxRight = useTransform(pageProgress, [0, 1], [0, 130])

  const filters = useMemo(
    () => ['Tous', ...new Set(projects.flatMap((project) => project.stack))],
    [],
  )
  const visibleProjects = useMemo(
    () => activeFilter === 'Tous' ? projects : projects.filter((project) => project.stack.includes(activeFilter)),
    [activeFilter],
  )

  useEffect(() => {
    localStorage.setItem('portfolio-theme', lightMode ? 'light' : 'dark')
    document.documentElement.dataset.theme = lightMode ? 'light' : 'dark'
  }, [lightMode])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    function closeMenuOnEscape(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeMenuOnEscape)
    return () => window.removeEventListener('keydown', closeMenuOnEscape)
  }, [])

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className={`site-shell${lightMode ? ' light-mode' : ''}`} id="top">
      <ReadingProgress />
      <a className="skip-link" href="#main">Aller au contenu</a>

      <motion.header className={`site-header${scrolled ? ' scrolled' : ''}`} initial={reduceMotion ? false : { y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 0.55 }}>
        <nav className="nav-wrap" aria-label="Navigation principale">
          <a className="brand" href="#top" aria-label={`${personal.name}, accueil`}>B<span>.</span>O</a>
          <div id="primary-links" className={`nav-actions${menuOpen ? ' is-open' : ''}`}>
            <a href="#about" onClick={closeMenu}>À propos</a>
            <a href="#skills" onClick={closeMenu}>Compétences</a>
            <a href="#projects" onClick={closeMenu}>Projets</a>
            <a href="#journey" onClick={closeMenu}>Parcours</a>
            <a href="#contact" onClick={closeMenu}>Contact</a>
          </div>
          <div className="nav-tools">
            <button className="icon-button theme-toggle" type="button" aria-label={lightMode ? 'Activer le thème sombre' : 'Activer le thème clair'} onClick={() => setLightMode((value) => !value)}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={lightMode ? 'moon' : 'sun'} initial={reduceMotion ? false : { rotate: -35, opacity: 0, scale: 0.7 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={reduceMotion ? undefined : { rotate: 35, opacity: 0, scale: 0.7 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}>
                  {lightMode ? <Moon size={20} /> : <Sun size={20} />}
                </motion.span>
              </AnimatePresence>
            </button>
            <button className="icon-button menu-button" type="button" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen} aria-controls="primary-links" onClick={() => setMenuOpen((value) => !value)}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={menuOpen ? 'close' : 'menu'} initial={reduceMotion ? false : { rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={reduceMotion ? undefined : { rotate: 45, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.15 }}>
                  {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </motion.header>

      <main id="main">
        <section className="hero-section" aria-labelledby="hero-title">
          <motion.div className="hero-decor hero-decor-left" style={{ y: reduceMotion ? 0 : parallaxLeft }} aria-hidden="true" />
          <motion.div className="hero-decor hero-decor-right" style={{ y: reduceMotion ? 0 : parallaxRight }} aria-hidden="true" />
          <div className="hero-grid" aria-hidden="true" />
          <motion.div className="hero-content" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.14, delayChildren: 0.2 } } }}>
            <motion.p className="availability hero-item" variants={revealVariants} transition={{ duration: reduceMotion ? 0 : 0.55 }}>
              <span className="availability-dot" /> {personal.availability}<span className="availability-separator">·</span>{personal.location}
            </motion.p>
            <h1 id="hero-title" className="hero-title">
              <span className="hero-title-line">
                {'Salut, je suis'.split(' ').map((word, index) => (
                  <motion.span key={word} className="hero-word" initial={reduceMotion ? false : { opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.4 + index * 0.09 }}>
                    {word}{index < 2 ? '\u00a0' : ''}
                  </motion.span>
                ))}
              </span>
              <motion.span className="hero-name" initial={reduceMotion ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : 0.7 }}>
                {personal.shortName}<span className="name-period">.</span>
              </motion.span>
            </h1>
            <motion.p className="role-line hero-item" variants={revealVariants} transition={{ duration: reduceMotion ? 0 : 0.55 }}>
              <RoleTypewriter />
            </motion.p>
            <motion.p className="hero-copy hero-item" variants={revealVariants} transition={{ duration: reduceMotion ? 0 : 0.55 }}>
              Je transforme les idées en expériences web rapides, accessibles et soignées — en recherche d&apos;un stage, d&apos;une alternance ou d&apos;un premier emploi.
            </motion.p>
            <motion.div className="hero-cta hero-item" variants={revealVariants} transition={{ duration: reduceMotion ? 0 : 0.55 }}>
              <MagneticLink className="button button-primary" href="#projects">Voir mes projets <ArrowRight size={18} /></MagneticLink>
              <MagneticLink className="button button-secondary" href="#contact"><Mail size={18} /> Me contacter</MagneticLink>
            </motion.div>
            <motion.button className="cv-link hero-item" type="button" onClick={() => setCvPreviewOpen(true)} variants={revealVariants} transition={{ duration: reduceMotion ? 0 : 0.55 }}>
              <ArrowDownToLine size={18} /> Aperçu et téléchargement du CV
            </motion.button>
          </motion.div>
          <div className="hero-bottom-note"><span>01</span> PORTFOLIO / 2026</div>
          <a className="scroll-cue" href="#about" aria-label="Défiler vers la section à propos"><span /><ArrowDownToLine size={15} /></a>
        </section>

        <Reveal as="section" className="content-section about-section" id="about">
          <SectionTitle number="01" eyebrow="À propos" title="Du code avec une intention." description="Étudiant, développeur et curieux de tout ce qui rend le web plus humain." />
          <div className="about-grid">
            <div className="portrait-frame">
              <img src="/brouhane.jpeg" alt={`Portrait de ${personal.name}`} loading="lazy" />
              <motion.span className="portrait-frame-corner" aria-hidden="true" animate={reduceMotion ? undefined : { rotate: [0, 90, 180, 270, 360] }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }} />
              <span className="portrait-caption"><span className="availability-dot" /> {personal.location}</span>
              <span className="portrait-index">B.O / 01</span>
            </div>
            <div className="about-copy">
              <p>{personal.bio}</p>
              <p className="about-secondary">Mon approche : partir des besoins réels, garder une base technique claire et accorder aux détails visuels l’attention qu’ils méritent.</p>
              <div className="stats-grid">
                {personal.stats.map((stat) => (
                  <div className="stat-card" key={stat.label}>
                    <strong><AnimatedCounter value={stat.value} suffix={stat.suffix} /></strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
              <p className="location-note"><MapPin size={16} /> Basé à {personal.location} <span>·</span> Ouvert aux opportunités</p>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="content-section skills-section" id="skills">
          <SectionTitle number="02" eyebrow="Compétences" title="Ma boîte à outils." description="Des technologies choisies pour construire des produits utiles, du navigateur à la base de données." />
          <div className="skills-grid">
            {skillGroups.map((group, index) => <SkillCard key={group.title} group={group} index={index} />)}
          </div>
          <p className="skills-footnote"><span /> J’apprends et j’améliore mes outils à chaque projet.</p>
        </Reveal>

        <Reveal as="section" className="content-section projects-section" id="projects">
          <SectionTitle number="03" eyebrow="Projets choisis" title="Le meilleur, c’est le concret." description="Quelques projets d’apprentissage et de conception — les liens de démonstration sont à remplacer par vos URLs réelles." />
          <div className="projects-toolbar">
            <div className="filter-list" aria-label="Filtrer les projets par technologie">
              {filters.map((filter) => (
                <button className={`filter-chip${activeFilter === filter ? ' active' : ''}`} type="button" aria-pressed={activeFilter === filter} key={filter} onClick={() => setActiveFilter(filter)}>
                  {filter === 'Tous' && <span className="filter-dot" />}{filter}
                </button>
              ))}
            </div>
            <span className="project-count">{String(visibleProjects.length).padStart(2, '0')} projets</span>
          </div>
          <motion.div className="projects-grid" layout>
            <AnimatePresence mode="popLayout">
              {visibleProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} onSelect={setSelectedProject} />
              ))}
            </AnimatePresence>
          </motion.div>
        </Reveal>

        <Reveal as="section" className="content-section journey-section" id="journey">
          <SectionTitle number="04" eyebrow="Parcours" title="En chemin, et en mouvement." description="Une formation, des projets et une envie constante de progresser." />
          <div className="timeline-wrap" ref={timelineRef}>
            <motion.span className="timeline-progress" style={{ scaleY: reduceMotion ? (timelineInView ? timelineProgress : 0) : timelineScale }} />
            <ol className="timeline">
              {timeline.map((item, index) => {
                const ItemIcon = item.kind === 'formation' ? GraduationCap : item.kind === 'experience' ? BriefcaseBusiness : Code2
                return (
                  <Reveal as="li" className="timeline-item" key={`${item.date}-${item.title}`} delay={index * 0.04}>
                    <span className="timeline-marker"><ItemIcon size={15} /></span>
                    <article className="timeline-card">
                      <p className="timeline-date">{item.date} <span>{item.kind}</span></p>
                      <h3>{item.title}</h3>
                      <p className="timeline-place">{item.place}</p>
                      <p className="timeline-description">{item.description}</p>
                    </article>
                  </Reveal>
                )
              })}
            </ol>
          </div>
        </Reveal>

        <Reveal as="section" className="content-section contact-section" id="contact">
          <SectionTitle number="05" eyebrow="Contact" title="Et si on faisait équipe ?" description="Un stage, une alternance ou un projet à faire grandir ? Parlons-en." />
          <div className="contact-grid">
            <div className="contact-intro">
              <span className="contact-kicker"><span className="availability-dot" /> Ouvert aux opportunités</span>
              <h3>Une bonne collaboration commence par une conversation.</h3>
              <p>Décris-moi ton besoin, ton équipe ou ton idée. Je te répondrai dès que possible.</p>
              <a className="email-link" href={`mailto:${personal.email}`}><Mail size={18} /> {personal.email} <ArrowRight size={16} /></a>
              <div className="social-links">
                <a href={personal.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Code2 size={19} /><span>GitHub</span><ExternalLink size={13} /></a>
                <a href={personal.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><span className="linkedin-mark" aria-hidden="true">in</span><span>LinkedIn</span><ExternalLink size={13} /></a>
              </div>
            </div>
            <ContactForm />
          </div>
        </Reveal>
      </main>

      <footer className="site-footer">
        <a className="footer-brand" href="#top">B<span>.</span>O</a>
        <p>© {new Date().getFullYear()} {personal.name}. Fait avec intention à Lomé.</p>
        <nav aria-label="Liens rapides">
          <a href="#about">À propos</a>
          <a href="#projects">Projets</a>
          <a href="#contact">Contact</a>
        </nav>
        <motion.a className="back-top" href="#top" aria-label="Retour en haut" whileHover={reduceMotion ? undefined : { y: -3 }}>
          <ArrowUp size={18} />
        </motion.a>
      </footer>

      <AnimatePresence>
        {selectedProject && <ProjectDialog project={selectedProject} onClose={closeProject} />}
        {cvPreviewOpen && <CvPreviewDialog onClose={closeCvPreview} />}
      </AnimatePresence>
    </div>
  )
}

export default App
