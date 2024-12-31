import React, { useState, useEffect } from 'react';
import { useWebinarStore } from '../../../stores/webinarStore';
import { Reorder } from 'framer-motion';
import { GripVertical, Plus, ArrowLeft, Loader2, Save } from 'lucide-react';
import { generateSlides } from '../../../lib/openai';
import * as slidesDB from '../../../lib/database/slides';

interface Slide {
  id: string;
  title: string;
  content: string;
  type: 'intro' | 'story' | 'pain' | 'solution' | 'offer' | 'close';
  notes: string;
}

export function SlideEditor() {
  const { knowledgeBase, currentWebinarId } = useWebinarStore();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateInitialSlides = async () => {
      if (!knowledgeBase) return;
      
      try {
        const generatedSlides = await generateSlides(knowledgeBase);
        setSlides(generatedSlides);
      } catch (err) {
        setError('Failed to generate slides. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    };

    generateInitialSlides();
  }, [knowledgeBase]);

  const addSlide = (index: number) => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: 'New Slide',
      content: '',
      type: 'story',
      notes: ''
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    setSlides(newSlides);
  };

  const handleSave = async () => {
    if (!currentWebinarId) return;
    
    setIsSaving(true);
    try {
      await slidesDB.saveSlides(currentWebinarId, 
        slides.map((slide, index) => ({
          title: slide.title,
          content: slide.content,
          order_index: index,
          type: slide.type,
          notes: slide.notes
        }))
      );
      window.location.href = '/';
    } catch (err) {
      setError('Failed to save slides. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto mb-4" />
        <p className="text-gray-400">Generating your webinar slides...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 text-red-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Error Generating Slides</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Slides'}</span>
        </button>
      </div>

      <Reorder.Group axis="y" values={slides} onReorder={setSlides} className="space-y-4">
        {slides.map((slide, index) => (
          <React.Fragment key={slide.id}>
            <Reorder.Item value={slide} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <GripVertical className="w-5 h-5 text-gray-500 cursor-move mt-2" />
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) =>
                        setSlides(
                          slides.map((s) =>
                            s.id === slide.id ? { ...s, title: e.target.value } : s
                          )
                        )
                      }
                      className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg"
                      placeholder="Slide Title"
                    />
                    <select
                      value={slide.type}
                      onChange={(e) =>
                        setSlides(
                          slides.map((s) =>
                            s.id === slide.id ? { ...s, type: e.target.value as Slide['type'] } : s
                          )
                        )
                      }
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                      <option value="intro">Intro</option>
                      <option value="story">Story</option>
                      <option value="pain">Pain Point</option>
                      <option value="solution">Solution</option>
                      <option value="offer">Offer</option>
                      <option value="close">Close</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">
                      Content
                    </label>
                    <textarea
                      value={slide.content}
                      onChange={(e) =>
                        setSlides(
                          slides.map((s) =>
                            s.id === slide.id ? { ...s, content: e.target.value } : s
                          )
                        )
                      }
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                      rows={4}
                      placeholder="What should be covered in this slide..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">
                      Speaking Notes
                    </label>
                    <textarea
                      value={slide.notes}
                      onChange={(e) =>
                        setSlides(
                          slides.map((s) =>
                            s.id === slide.id ? { ...s, notes: e.target.value } : s
                          )
                        )
                      }
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                      rows={2}
                      placeholder="Notes and delivery tips..."
                    />
                  </div>
                </div>
              </div>
            </Reorder.Item>
            <button
              onClick={() => addSlide(index)}
              className="w-full py-2 border-2 border-dashed border-gray-700 rounded-lg text-gray-500 hover:border-teal-600 hover:text-teal-400 transition-colors"
            >
              <Plus className="w-5 h-5 mx-auto" />
            </button>
          </React.Fragment>
        ))}
      </Reorder.Group>
    </div>
  );
}