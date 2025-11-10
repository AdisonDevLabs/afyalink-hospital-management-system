import React, { lazy, Suspense } from 'react';

const LazyMotionDiv = lazy(() => import('./LazyMotionDiv'));

const AnimatedSection = ({ children, sectionRef, variants, viewport }) => {
  return (
    <Suspense fallback={<div ref={sectionRef}>{children}</div>}>
      <LazyMotionDiv sectionRef={sectionRef} variants={variants} viewport={viewport}>
        {children}
      </LazyMotionDiv>
    </Suspense>
  );
};

export default AnimatedSection;