"use client"
import { motion, useInView } from 'framer-motion';
import * as React from 'react';

export function WordsPullUp({ text, className = '', fontSize = '2rem', highlightColor = '#F4B342' }) {
    const words = text.split(' ');

    const pullupVariant = {
        initial: { y: 20, opacity: 0 },
        animate: (i) => ({
            y: 0,
            opacity: 1,
            transition: {
                delay: i * 0.1,
            },
        }),
    };

    const popVariant = {
        initial: { y: 20, opacity: 0, scale: 0.5 },
        animate: (i) => ({
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                delay: i * 0.1,
            },
        }),
    };

    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <div className={className} style={{ justifyContent: 'center' }}>
            {words.map((word, i) => {
                const isHighlighted = word.startsWith('*') && word.endsWith('*');
                const cleanWord = isHighlighted ? word.slice(1, -1) : word;

                return (
                    <motion.div
                        key={i}
                        ref={ref}
                        variants={isHighlighted ? popVariant : pullupVariant}
                        initial="initial"
                        animate={isInView ? 'animate' : ''}
                        custom={i}
                        style={{
                            paddingRight: '0.5rem',
                            fontWeight: isHighlighted ? 'lighter' : 'lighter',
                            fontSize: fontSize,
                            color: isHighlighted ? highlightColor : 'inherit',
                        }}
                        // className={className}
                    >
                        {cleanWord === '' ? <span>&nbsp;</span> : cleanWord}
                    </motion.div>
                );
            })}
        </div>
    );
}