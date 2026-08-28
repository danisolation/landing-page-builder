'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import HeroEditor from './editors/HeroEditor';
import FeaturesEditor from './editors/FeaturesEditor';
import CtaEditor from './editors/CtaEditor';
import StatsEditor from './editors/StatsEditor';
import TestimonialsEditor from './editors/TestimonialsEditor';
import SectionPreview from './SectionPreview';

interface SectionEditPanelProps {
  section?: any; // null = adding new
  onSave: (data: { type: string; content: any; order: number }) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const defaultContent: Record<string, any> = {
  hero: {
    heading: '',
    subheading: '',
    buttonText: '',
    buttonLink: '',
    secondaryButtonText: '',
    secondaryButtonLink: '',
  },
  features: {
    subtitle: '',
    title: '',
    description: '',
    items: [],
  },
  cta: {
    heading: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    secondaryButtonText: '',
    secondaryButtonLink: '',
  },
  stats: {
    title: '',
    items: [],
  },
  testimonials: {
    subtitle: '',
    title: '',
    description: '',
    items: [],
  },
};

const editors: Record<string, any> = {
  hero: HeroEditor,
  features: FeaturesEditor,
  cta: CtaEditor,
  stats: StatsEditor,
  testimonials: TestimonialsEditor,
};

export default function SectionEditPanel({
  section,
  onSave,
  onClose,
  isLoading,
}: SectionEditPanelProps) {
  const t = useTranslations('editPanel');
  const tCommon = useTranslations('common');
  const isEditing = !!section;

  const [type, setType] = useState(section?.type || 'hero');
  const [content, setContent] = useState(
    section?.content || defaultContent['hero']
  );
  const [order, setOrder] = useState(section?.order ?? 0);

  useEffect(() => {
    if (section) {
      setType(section.type);
      setContent(section.content);
      setOrder(section.order);
    } else {
      setType('hero');
      setContent(defaultContent['hero']);
      setOrder(0);
    }
  }, [section]);

  useEffect(() => {
    if (!section) {
      setContent(defaultContent[type] || {});
    }
  }, [type, section]);

  const EditorComponent = editors[type];

  const handleSave = () => {
    onSave({ type, content, order });
  };

  // Lock body scroll on mobile when panel is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="h-full flex flex-col bg-card border-l border-border shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/50 shrink-0">
        <h3 className="font-semibold text-foreground text-base">
          {isEditing ? t('editSection') : t('addSection')}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-5">
          {/* Type + Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('sectionType')}
              </Label>
              <Select
                value={type}
                onValueChange={setType}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero">Hero</SelectItem>
                  <SelectItem value="features">Features</SelectItem>
                  <SelectItem value="cta">CTA</SelectItem>
                  <SelectItem value="stats">Stats</SelectItem>
                  <SelectItem value="testimonials">Testimonials</SelectItem>
                </SelectContent>
              </Select>
              {isEditing && (
                <p className="text-xs text-muted-foreground">{t('typeLocked')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('order')}
              </Label>
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          {/* Type-specific editor */}
          {EditorComponent && (
            <div className="border-t border-border pt-5">
              <EditorComponent content={content} onChange={setContent} />
            </div>
          )}

          {/* Live Preview */}
          <div className="border-t border-border pt-5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
              {t('preview')}
            </Label>
            <SectionPreview type={type} content={content} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 px-5 py-4 border-t border-border bg-muted/50 shrink-0">
        <Button onClick={handleSave} disabled={isLoading} size="sm">
          <Save size={14} className="mr-1.5" />
          {isLoading ? tCommon('saving') : tCommon('save')}
        </Button>
        <Button variant="outline" onClick={onClose} size="sm">
          {tCommon('cancel')}
        </Button>
      </div>
    </motion.div>
  );
}
