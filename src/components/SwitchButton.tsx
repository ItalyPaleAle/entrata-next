import styles from './SwitchButton.module.css'

export default function SwitchButton({ active = false }) {
    return <span className={`inline-block ${styles['switch']} ${active ? styles['active'] : ''}`} />
}
