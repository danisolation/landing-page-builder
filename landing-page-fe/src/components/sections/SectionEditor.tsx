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

  // Reset content when type changes (only for new sections)
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
        <CardHeader>
          <CardTitle>
            {section ? 'Sửa Section' : 'Thêm Section Mới'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loại Section</Label>
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
              <Label>Thứ tự</Label>
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          {/* Section-specific editor */}
          {EditorComponent && (
            <EditorComponent content={content} onChange={setContent} />
          )}

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Hủy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <SectionPreview type={type} content={content} />
        </CardContent>
      </Card>
    </div>
  );
}
