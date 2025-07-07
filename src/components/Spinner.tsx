import styles from './Spinner.module.css'

export default function Spinner() {
    return (
        <div className="mt-20 flex justify-center" role="status">
            <div className={styles['sk-chase']}>
                <div className={styles['sk-chase-dot']}></div>
                <div className={styles['sk-chase-dot']}></div>
                <div className={styles['sk-chase-dot']}></div>
                <div className={styles['sk-chase-dot']}></div>
                <div className={styles['sk-chase-dot']}></div>
                <div className={styles['sk-chase-dot']}></div>
            </div>
            <span className="sr-only">Loading…</span>
        </div>
    )
}
