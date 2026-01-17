import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const getRandomNote = () => {
    const clef = Math.random() > 0.5 ? 'treble' : 'bass';
    // Range:
    // Treble: C4 (Middle C) to A5.
    // Bass: E2 to C4.

    let octave, noteIndex;

    if (clef === 'treble') {
        // C4 to A5
        // C4 is index 0 in our logic roughly.
        // Let's pick octave 4 or 5.
        octave = Math.floor(Math.random() * 2) + 4; // 4 or 5
        // If 5, limit to A (index 5)
        const maxIndex = octave === 5 ? 5 : 6;
        noteIndex = Math.floor(Math.random() * (maxIndex + 1));
    } else {
        // Bass
        // E2 to C4.
        octave = Math.floor(Math.random() * 2) + 2; // 2, 3
        if (octave === 4) {
            // Only C4 allowed
            octave = 4;
            noteIndex = 0;
        } else if (octave === 2) {
            // E2 is min, which is index 2.
            noteIndex = Math.floor(Math.random() * 5) + 2;
        } else {
            // 3: C3 to B3
            noteIndex = Math.floor(Math.random() * 7);
        }
    }

    return {
        note: NOTES[noteIndex],
        octave,
        clef
    };
};

const Staff = ({ note }) => {
    // SVG config
    const width = 200;
    const height = 200;
    const lineGap = 10; // Space between lines
    // Staff usually has 5 lines.
    // Center the staff in local coordinates.
    const staffTop = 80;
    const staffBottom = staffTop + 4 * lineGap;

    // Calculate note position
    // Treble: Bottom line (E4) is index 0 for lines.
    // Standard positions from E4 going up:
    // E4: line 1 (bottom). Y = staffBottom.
    // F4: space 1. Y = staffBottom - 0.5 * gap.
    // G4: line 2. Y = staffBottom - 1 * gap.

    const getNoteY = (n, o, clef) => {
        // Convert to semitones or steps from a reference.
        // Reference for calculation: Bottom Line.
        // Treble Bottom Line = E4.
        // Bass Bottom Line = G2.

        const noteMap = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
        const val = o * 7 + noteMap[n];

        let bottomRefVal;
        if (clef === 'treble') {
            // E4
            bottomRefVal = 4 * 7 + 2;
        } else {
            // G2
            bottomRefVal = 2 * 7 + 4;
        }

        const stepDiff = val - bottomRefVal;
        // Each step is 0.5 * lineGap up.
        // Higher pitch = Lower Y.
        return staffBottom - (stepDiff * (lineGap / 2));
    };

    const noteY = getNoteY(note.note, note.octave, note.clef);

    // Ledger lines?
    // If noteY > staffBottom (below staff) or noteY < staffTop (above staff).
    // Draw small lines at integer steps.

    const ledgers = [];
    // Check below
    for (let y = staffBottom + lineGap; y <= noteY; y += lineGap) {
        ledgers.push(y);
    }
    // Check above
    for (let y = staffTop - lineGap; y >= noteY; y -= lineGap) {
        ledgers.push(y);
    }

    // Clef Symbol
    // Use Unicode or simple text.
    const clefSymbol = note.clef === 'treble' ? '𝄞' : '𝄢';
    const clefY = note.clef === 'treble' ? staffBottom - lineGap : staffTop + lineGap;

    return (
        <div className="staff-container">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {/* Staff Lines */}
                {[0, 1, 2, 3, 4].map(i => (
                    <line
                        key={i}
                        x1="20" y1={staffTop + i * lineGap}
                        x2="180" y2={staffTop + i * lineGap}
                        stroke="white"
                        strokeWidth="2"
                    />
                ))}

                {/* Clef */}
                <text
                    x="30"
                    y={staffBottom - lineGap}
                    fill="white"
                    fontSize="40"
                    fontFamily="Arial"
                    dominantBaseline="central"
                >
                    {clefSymbol}
                </text>

                {/* Ledger Lines */}
                {ledgers.map((y, i) => (
                    <line
                        key={`l-${i}`}
                        x1="90" y1={y}
                        x2="130" y2={y}
                        stroke="white"
                        strokeWidth="2"
                    />
                ))}

                {/* Note */}
                <ellipse
                    cx="110"
                    cy={noteY}
                    rx="6"
                    ry="5"
                    fill="white"
                />
                {/* Stem */}
                <line
                    x1={note.octave >= 5 || (note.clef === 'bass' && note.octave >= 3) ? "104" : "116"}
                    y1={noteY}
                    x2={note.octave >= 5 || (note.clef === 'bass' && note.octave >= 3) ? "104" : "116"}
                    y2={note.octave >= 5 || (note.clef === 'bass' && note.octave >= 3) ? noteY + 30 : noteY - 30}
                    stroke="white"
                    strokeWidth="2"
                />
            </svg>
            <p style={{ marginTop: '-20px', color: '#94a3b8', fontSize: '0.9rem' }}>{note.clef === 'treble' ? 'Treble Clef' : 'Bass Clef'}</p>
        </div>
    );
};

const MusicTrainer = () => {
    const [round, setRound] = useState(1);
    const [score, setScore] = useState(0);
    const [currentNote, setCurrentNote] = useState(getRandomNote());
    const [userAnswer, setUserAnswer] = useState('');
    const [status, setStatus] = useState('guessing'); // guessing, feedback, finished
    const [feedback, setFeedback] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (status === 'guessing' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [status]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const ans = userAnswer.trim().toUpperCase();
        if (!ans) return;

        // Check answer
        const correct = currentNote.note; // Expecting just the letter 'C', 'D' etc.
        if (ans === correct) {
            setScore(s => s + 1);
            setFeedback('Correct!');
        } else {
            setFeedback(`Wrong! It was ${correct}${currentNote.octave}`); // Show full note for education
        }
        setStatus('feedback');
    };

    const handleNext = () => {
        if (round >= 10) {
            setStatus('finished');
        } else {
            setRound(r => r + 1);
            setCurrentNote(getRandomNote());
            setUserAnswer('');
            setFeedback('');
            setStatus('guessing');
        }
    };

    const handleRestart = () => {
        setRound(1);
        setScore(0);
        setCurrentNote(getRandomNote());
        setUserAnswer('');
        setFeedback('');
        setStatus('guessing');
    };

    return (
        <div className="music-trainer-container">
            <header>
                <Link to="/" className="back-link">← Back</Link>
                <h1>Music Trainer</h1>
            </header>

            <div className="game-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {status !== 'finished' ? (
                    <>
                        <div className="stats" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                            <span>Round: {round} / 10</span>
                            <span>Score: {score}</span>
                        </div>

                        <div className="staff-display" style={{ marginBottom: '2rem' }}>
                            <Staff note={currentNote} />
                        </div>

                        {status === 'guessing' ? (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                                <p>Enter the note name (A-G):</p>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    maxLength="1"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
                                    style={{
                                        padding: '0.5rem',
                                        fontSize: '1.5rem',
                                        textAlign: 'center',
                                        width: '60px',
                                        background: 'var(--surface-color)',
                                        border: '1px solid var(--primary-color)',
                                        color: 'white',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                                <button type="submit" className="btn-primary" style={{
                                    padding: '0.5rem 2rem',
                                    background: 'var(--primary-color)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}>Normal Submit</button>
                            </form>
                        ) : (
                            <div className="feedback-section" style={{ textAlign: 'center', animation: 'fadeIn 0.3s' }}>
                                <h2 style={{ color: feedback.startsWith('Correct') ? 'var(--success-color)' : 'var(--danger-color)', marginBottom: '1rem' }}>
                                    {feedback}
                                </h2>
                                <button
                                    onClick={handleNext}
                                    ref={btn => btn && btn.focus()}
                                    style={{
                                        padding: '0.5rem 2rem',
                                        background: 'var(--secondary-color)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}>
                                    {round >= 10 ? 'See Results' : 'Next Note'}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="results-section" style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Complete!</h2>
                        <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Final Score: {score} / 10</p>
                        <div className="actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={handleRestart} style={{
                                padding: '0.5rem 2rem',
                                background: 'var(--primary-color)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}>Play Again</button>
                            <Link to="/" style={{
                                padding: '0.5rem 2rem',
                                background: 'var(--surface-color)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '0.5rem',
                                color: 'white',
                                fontWeight: 'bold'
                            }}>Home</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MusicTrainer;
