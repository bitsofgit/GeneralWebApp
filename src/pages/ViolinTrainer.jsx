import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const getRandomNote = () => {
    // Violin is Treble Clef ONLY
    const clef = 'treble';

    // Range: G3 (lowest string) to C6
    // G3 is index 4 in NOTES=['C','D','E','F','G','A','B']

    // We need to pick an octave 3, 4, 5, or 6
    // Weighted logic or simple rejection sampling?
    // Let's use customized logic for valid ranges per octave.

    const octave = Math.floor(Math.random() * 4) + 3; // 3, 4, 5, 6

    let noteIndex;

    if (octave === 3) {
        // G3, A3, B3
        // Indices 4, 5, 6
        noteIndex = Math.floor(Math.random() * 3) + 4;
    } else if (octave === 6) {
        // Only C6
        noteIndex = 0;
    } else {
        // Octaves 4 and 5: Full range C-B
        noteIndex = Math.floor(Math.random() * 7);
    }

    return {
        note: NOTES[noteIndex],
        octave,
        clef
    };
};

const Staff = ({ note }) => {
    const width = 400;
    const height = 400;
    const lineGap = 20;
    const staffTop = 160;
    const staffBottom = staffTop + 4 * lineGap;

    const getNoteY = (n, o) => {
        const noteMap = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
        const val = o * 7 + noteMap[n];

        // Treble Clef Bottom Line is E4
        // E4 val = 4 * 7 + 2 = 30
        const bottomRefVal = 30; // 4*7 + 2

        const stepDiff = val - bottomRefVal;
        return staffBottom - (stepDiff * (lineGap / 2));
    };

    const noteY = getNoteY(note.note, note.octave);

    const ledgers = [];
    // Ledger lines below
    for (let y = staffBottom + lineGap; y <= noteY; y += lineGap) {
        ledgers.push(y);
    }
    // Ledger lines above
    for (let y = staffTop - lineGap; y >= noteY; y -= lineGap) {
        ledgers.push(y);
    }

    const clefSymbol = '𝄞';

    return (
        <div className="staff-container" style={{ transform: 'scale(1)', transition: 'transform 0.3s' }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {/* Staff Lines */}
                {[0, 1, 2, 3, 4].map(i => (
                    <line
                        key={i}
                        x1="40" y1={staffTop + i * lineGap}
                        x2="360" y2={staffTop + i * lineGap}
                        stroke="rgba(255,255,255,0.8)"
                        strokeWidth="4"
                    />
                ))}

                {/* Clef */}
                <text
                    x="60"
                    y={staffBottom - lineGap}
                    fill="var(--secondary-color)"
                    fontSize="80"
                    fontFamily="Arial"
                    dominantBaseline="central"
                >
                    {clefSymbol}
                </text>

                {/* Ledger Lines */}
                {ledgers.map((y, i) => (
                    <line
                        key={`l-${i}`}
                        x1="180" y1={y}
                        x2="260" y2={y}
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="4"
                    />
                ))}

                {/* Note */}
                <ellipse
                    cx="220"
                    cy={noteY}
                    rx="12"
                    ry="10"
                    fill="var(--text-primary)"
                />
                {/* Stem */}
                <line
                    x1={note.octave >= 5 ? "208" : "232"}
                    y1={noteY}
                    x2={note.octave >= 5 ? "208" : "232"}
                    y2={note.octave >= 5 ? noteY + 60 : noteY - 60}
                    stroke="var(--text-primary)"
                    strokeWidth="4"
                />
            </svg>
            <p style={{ marginTop: '-40px', color: 'var(--text-secondary)', fontSize: '1.2rem', textAlign: 'center' }}>
                Violin (Treble Clef)
            </p>
        </div>
    );
};

const ViolinTrainer = () => {
    const [round, setRound] = useState(1);
    const [score, setScore] = useState(0);
    const [currentNote, setCurrentNote] = useState(getRandomNote());
    const [userAnswer, setUserAnswer] = useState('');
    const [status, setStatus] = useState('guessing');
    const [feedbackType, setFeedbackType] = useState(null);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (status === 'guessing' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [status]);

    const handleNext = () => {
        if (round >= 10) {
            setStatus('finished');
        } else {
            setRound(r => r + 1);
            setCurrentNote(getRandomNote());
            setUserAnswer('');
            setFeedbackType(null);
            setFeedbackMessage('');
            setStatus('guessing');
        }
    };

    const submitAnswer = () => {
        const ans = userAnswer.trim().toUpperCase();
        if (!ans) return;

        const correct = currentNote.note;

        if (ans === correct) {
            setScore(s => s + 1);
            setFeedbackType('correct');
            setFeedbackMessage('Correct!');
            setStatus('feedback');
            setTimeout(() => {
                handleNext();
            }, 500);
        } else {
            setFeedbackType('wrong');
            setFeedbackMessage(`Wrong! It was ${correct}`);
            setStatus('feedback');
            setTimeout(() => {
                handleNext();
            }, 3000);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            submitAnswer();
        }
    };

    const handleRestart = () => {
        setRound(1);
        setScore(0);
        setCurrentNote(getRandomNote());
        setUserAnswer('');
        setFeedbackType(null);
        setStatus('guessing');
    };

    const getFlashStyle = () => {
        if (feedbackType === 'correct') return { boxShadow: '0 0 100px rgba(16, 185, 129, 0.5) inset', borderColor: 'var(--success-color)' };
        if (feedbackType === 'wrong') return { boxShadow: '0 0 100px rgba(239, 68, 68, 0.5) inset', borderColor: 'var(--danger-color)' };
        return {};
    };

    return (
        <div className="music-trainer-container">
            <header style={{ width: '100%', marginBottom: '2rem' }}>
                <Link to="/" className="back-link">← Back</Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--surface-highlight)', paddingBottom: '1rem' }}>
                    <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(to right, var(--accent-color), var(--secondary-color))', WebkitBackgroundClip: 'text', color: 'transparent' }}>Violin Trainer</h1>
                    <div className="stats" style={{ display: 'flex', gap: '2rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                        <span>Round <strong style={{ color: 'var(--text-primary)' }}>{round}</strong>/10</span>
                        <span>Score <strong style={{ color: 'var(--primary-color)' }}>{score}</strong></span>
                    </div>
                </div>
            </header>

            <div className="game-area"
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                }}>

                {status !== 'finished' ? (
                    <div className="play-container" style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4rem',
                        width: '100%',
                        transition: 'all 0.3s'
                    }}>
                        <div className="staff-display" style={{
                            filter: 'drop-shadow(0 0 20px rgba(244, 114, 182, 0.1))',
                            transform: feedbackType === 'correct' ? 'scale(1.1)' : 'scale(1)',
                            transition: 'transform 0.2s'
                        }}>
                            <Staff note={currentNote} />
                        </div>

                        <div className="interaction-area" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '3rem',
                            borderRadius: '2rem',
                            background: 'rgba(30, 41, 59, 0.4)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.3s',
                            ...getFlashStyle()
                        }}>
                            {status === 'guessing' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Type note (A-G)</p>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        maxLength="1"
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
                                        onKeyDown={handleKeyDown}
                                        autoFocus
                                        style={{
                                            padding: '1rem',
                                            fontSize: '4rem',
                                            textAlign: 'center',
                                            width: '140px',
                                            height: '140px',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            border: '2px solid var(--accent-color)',
                                            color: 'var(--accent-color)',
                                            borderRadius: '1rem',
                                            outline: 'none',
                                            boxShadow: '0 0 30px -5px rgba(244, 114, 182, 0.2)',
                                            fontWeight: '800'
                                        }}
                                    />
                                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Press [Enter] to submit</p>
                                </div>
                            ) : (
                                <div className="feedback-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.2s ease-out' }}>

                                    {feedbackType === 'correct' ? (
                                        <h2 style={{ fontSize: '3rem', color: 'var(--success-color)', textShadow: '0 0 20px rgba(16, 185, 129, 0.5)' }}>
                                            Correct!
                                        </h2>
                                    ) : (
                                        <>
                                            <h2 style={{ fontSize: '2.5rem', color: 'var(--danger-color)', marginBottom: '0.5rem' }}>Wrong!</h2>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Answer was:</p>
                                            <div style={{
                                                fontSize: '4rem',
                                                fontWeight: '800',
                                                color: 'var(--text-primary)',
                                                margin: '1rem 0'
                                            }}>
                                                {currentNote.note}
                                            </div>
                                            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    background: 'var(--accent-color)',
                                                    animation: 'countdown 3s linear forwards'
                                                }} />
                                            </div>
                                        </>
                                    )}

                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="results-section" style={{ textAlign: 'center', animation: 'scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                        <h2 style={{ fontSize: '4rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--accent-color), var(--secondary-color))', WebkitBackgroundClip: 'text', color: 'transparent' }}>Complete!</h2>
                        <p style={{ fontSize: '2rem', marginBottom: '3rem', color: 'var(--text-secondary)' }}>Final Score: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{score}</span> / 10</p>
                        <div className="actions" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                            <button onClick={handleRestart} style={{
                                padding: '1rem 3rem',
                                fontSize: '1.1rem',
                                background: 'var(--accent-color)',
                                border: 'none',
                                borderRadius: '0.8rem',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                boxShadow: '0 10px 20px -5px rgba(244, 114, 182, 0.4)'
                            }}>Play Again</button>
                            <Link to="/" style={{
                                padding: '1rem 3rem',
                                fontSize: '1.1rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.8rem',
                                color: 'var(--text-primary)',
                                fontWeight: 'bold',
                                transition: 'background 0.2s'
                            }}>Home</Link>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                @keyframes countdown { from { width: 100%; } to { width: 0%; } }
            `}</style>
        </div>
    );
};

export default ViolinTrainer;
