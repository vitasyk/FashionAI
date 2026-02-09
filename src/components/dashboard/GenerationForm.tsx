import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateJob } from '@/hooks/useGenerationJobs';
import { useCredits } from '@/hooks/useCredits';
import { Loader2, Wand2 } from 'lucide-react';

const MODEL_PRESETS = [
  { value: 'fashion_female', label: 'Female Model' },
  { value: 'fashion_male', label: 'Male Model' },
  { value: 'diverse', label: 'Diverse Models' },
];

const SCENE_PRESETS = [
  { value: 'studio_white', label: 'Studio - White Background' },
  { value: 'studio_grey', label: 'Studio - Grey Background' },
  { value: 'outdoor_urban', label: 'Urban Street' },
  { value: 'outdoor_nature', label: 'Natural Setting' },
  { value: 'indoor_luxury', label: 'Luxury Interior' },
  { value: 'runway', label: 'Fashion Runway' },
];

const POSE_PRESETS = [
  { value: 'standing_front', label: 'Standing - Front' },
  { value: 'standing_side', label: 'Standing - Side' },
  { value: 'walking', label: 'Walking' },
  { value: 'sitting', label: 'Sitting' },
  { value: 'dynamic', label: 'Dynamic Pose' },
];

export default function GenerationForm() {
  const [prompt, setPrompt] = useState('');
  const [modelPreset, setModelPreset] = useState('fashion_female');
  const [scenePreset, setScenePreset] = useState('studio_white');
  const [posePreset, setPosePreset] = useState('standing_front');
  
  const createJob = useCreateJob();
  const { data: credits } = useCredits();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    await createJob.mutateAsync({
      prompt: prompt.trim(),
      modelPreset,
      scenePreset,
      posePreset,
    });

    setPrompt('');
  };

  const insufficientCredits = (credits ?? 0) < 1;

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Wand2 className="w-5 h-5 text-primary" />
          Generate Fashion Photo
        </CardTitle>
        <CardDescription>
          Describe your product and the desired look. Each generation costs 1 credit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Product Description</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., A sleek black leather jacket with silver zippers, styled casually with jeans"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] bg-secondary/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model Type</Label>
              <Select value={modelPreset} onValueChange={setModelPreset}>
                <SelectTrigger id="model" className="bg-secondary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scene">Scene/Background</Label>
              <Select value={scenePreset} onValueChange={setScenePreset}>
                <SelectTrigger id="scene" className="bg-secondary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCENE_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pose">Pose</Label>
              <Select value={posePreset} onValueChange={setPosePreset}>
                <SelectTrigger id="pose" className="bg-secondary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSE_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-gold hover:opacity-90 transition-opacity"
            disabled={createJob.isPending || insufficientCredits || !prompt.trim()}
          >
            {createJob.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Generation...
              </>
            ) : insufficientCredits ? (
              'No Credits Available'
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate (1 Credit)
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
