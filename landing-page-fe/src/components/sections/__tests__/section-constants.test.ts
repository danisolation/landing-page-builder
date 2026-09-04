import { describe, it, expect } from 'vitest';
import { defaultContent, sectionTypes } from '../section-constants';

describe('section-constants', () => {
  describe('sectionTypes', () => {
    it('should contain the implemented section types', () => {
      expect(sectionTypes).toHaveLength(8);
    });

    it('should include all expected types', () => {
      expect(sectionTypes).toContain('hero');
      expect(sectionTypes).toContain('features');
      expect(sectionTypes).toContain('cta');
      expect(sectionTypes).toContain('stats');
      expect(sectionTypes).toContain('testimonials');
      expect(sectionTypes).toContain('pricing');
      expect(sectionTypes).toContain('faq');
      expect(sectionTypes).toContain('logoCloud');
    });
  });

  describe('defaultContent', () => {
    it('should have default content for every section type', () => {
      for (const type of sectionTypes) {
        expect(defaultContent[type]).toBeDefined();
      }
    });

    it('hero default should have required fields', () => {
      const hero = defaultContent.hero;
      expect(hero).toHaveProperty('heading');
      expect(hero).toHaveProperty('subheading');
      expect(hero).toHaveProperty('buttonText');
      expect(hero).toHaveProperty('buttonLink');
    });

    it('features default should have empty items array', () => {
      const features = defaultContent.features;
      expect(features).toHaveProperty('items');
      expect(Array.isArray(features.items)).toBe(true);
      expect(features.items).toHaveLength(0);
    });

    it('stats default should have empty items array', () => {
      const stats = defaultContent.stats;
      expect(stats).toHaveProperty('items');
      expect(Array.isArray(stats.items)).toBe(true);
    });

    it('testimonials default should have empty items array', () => {
      const testimonials = defaultContent.testimonials;
      expect(testimonials).toHaveProperty('items');
      expect(Array.isArray(testimonials.items)).toBe(true);
    });

    it('cta default should have heading and buttonText', () => {
      const cta = defaultContent.cta;
      expect(cta).toHaveProperty('heading');
      expect(cta).toHaveProperty('buttonText');
    });
  });
});
