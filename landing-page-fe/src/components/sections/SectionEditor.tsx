'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import HeroEditor from './editors/HeroEditor';
import FeaturesEditor from './editors/FeaturesEditor';
import CtaEditor from './editors/CtaEditor';
import SectionPreview from './SectionPreview';

interface SectionEditorProps {
  section?: any;
  onSave: (data: { type: string; content: any; order: number }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const defaultContent: Record<string, any> = {
  hero: {
    heading: '',
    subheading: '',
    buttonText: '',
    buttonLink: '',
  },
  features: {
    title: '',
    items: [],
  },
  cta: {
    heading: '',
    buttonText: '',
    buttonLink: '',
  },
};

const editors: Record<string, any> = {
  hero: HeroEditor,
  features: FeaturesEditor,
  cta: CtaEditor,
};

export default function SectionEditor({
  section,
  onSave,
  onCancel,
  isLoading,
}: SectionEditorProps) {
  const [type, setType] = useState(section?.type || 'hero');
  const [content, setContent] = useState(
    section?.content || defaultContent['hero']
  );
  const [order, setOrder] = useState(section?.order || 0);

  useEffect(() => {
    if (!section) {
      setContent(defaultContent[type] || {});
    }
  }, [type, section]);

  const EditorComponent = editors[type];

  const handleSave = () => {
    onSave({ type, content, order });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            {section ? 'Sua Section' : 'Them Section Moi'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Loai Section</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero">Hero</SelectItem>
                  <SelectItem value="features">Features</SelectItem>
                  <SelectItem value="cta">CTA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Thu tu</Label>
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          {EditorComponent && (
            <EditorComponent content={content} onChange={setContent} />
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button onClick={handleSave} disabled={isLoading} size="sm">
              {isLoading ? 'Dang luu...' : 'Luu'}
            </Button>
            <Button variant="outline" onClick={onCancel} size="sm">
              Huy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <SectionPreview type={type} content={content} />
        </CardContent>
      </Card>
    </div>
  );
}
