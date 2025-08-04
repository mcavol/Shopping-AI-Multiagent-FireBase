'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ChefHat,
  Loader,
  RefreshCw,
  ShoppingBasket,
  Sparkles,
  Wallet,
} from 'lucide-react';

import type { FinalShoppingList, Recipe, SuggestedRecipes } from '@/lib/types';
import { handleGetShoppingList, handleSuggestRecipes } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VoiceRecorder } from '@/components/voice-recorder';
import { useToast } from '@/hooks/use-toast';
import { Icons } from './icons';
import { Skeleton } from './ui/skeleton';

type Step = 'initial' | 'loadingRecipes' | 'showRecipes' | 'loadingList' | 'showList' | 'error';

export function ShoppingAssistant() {
  const [step, setStep] = useState<Step>('initial');
  const [userInput, setUserInput] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState('4');
  const [budget, setBudget] = useState('25');
  const [suggestedRecipes, setSuggestedRecipes] = useState<SuggestedRecipes | null>(null);
  const [finalList, setFinalList] = useState<FinalShoppingList | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleSubmitForRecipes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !numberOfPeople || !budget) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields to get recipe suggestions.',
      });
      return;
    }
    setStep('loadingRecipes');
    setError(null);
    const result = await handleSuggestRecipes(
      userInput,
      parseInt(numberOfPeople),
      parseInt(budget)
    );
    if (result.error || !result.data) {
      setError(result.error || 'An unknown error occurred.');
      setStep('error');
    } else {
      setSuggestedRecipes(result.data);
      setStep('showRecipes');
    }
  };

  const handleSelectRecipe = async (recipe: Recipe) => {
    setStep('loadingList');
    setError(null);
    const result = await handleGetShoppingList(recipe.ingredients, parseInt(budget));
    if (result.error || !result.data) {
      setError(result.error || 'An unknown error occurred.');
      setStep('error');
    } else {
      setFinalList(result.data);
      setStep('showList');
    }
  };
  
  const handleReset = () => {
    setStep('initial');
    setUserInput('');
    setSuggestedRecipes(null);
    setFinalList(null);
    setError(null);
  };

  const renderInitialForm = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Card className="overflow-hidden shadow-2xl shadow-primary/10">
        <form onSubmit={handleSubmitForRecipes}>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">What are we cooking today?</CardTitle>
            <CardDescription>Tell me what you have in mind, and I&apos;ll create a shopping list for you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userInput">Your Idea</Label>
              <div className="relative">
                <Textarea
                  id="userInput"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="e.g., Prepare a shopping list for a healthy dinner"
                  className="pr-20"
                  rows={3}
                />
                <VoiceRecorder onTranscription={setUserInput} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numberOfPeople">How many people?</Label>
                <Input
                  id="numberOfPeople"
                  type="number"
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(e.target.value)}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              <Sparkles className="mr-2" />
              Generate Recipe Ideas
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
  
  const renderLoading = (text: string) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4 py-16">
        <Loader className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="font-headline text-2xl">{text}</p>
        <p className="text-muted-foreground">The AI is thinking...</p>
        <div className="space-y-4 pt-8 w-full max-w-md mx-auto">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    </motion.div>
  );

  const renderRecipes = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="font-headline text-3xl">Recipe Suggestions</h2>
            <Button variant="outline" onClick={handleReset}><ArrowLeft className="mr-2" /> Back</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedRecipes?.recipes.map((recipe, index) => (
                <motion.div key={recipe.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2"><ChefHat /> {recipe.name}</CardTitle>
                        <CardDescription>{recipe.suitability}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="font-bold text-lg text-primary">${recipe.estimatedCost.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Estimated Cost</p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handleSelectRecipe(recipe)}>
                            <ShoppingBasket className="mr-2" /> Create Shopping List
                        </Button>
                    </CardFooter>
                </Card>
                </motion.div>
            ))}
        </div>
    </motion.div>
  );

  const renderShoppingList = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-headline text-4xl">Your Shopping List</h2>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="mr-2 h-4 w-4" /> Start Over
        </Button>
      </div>
      <Card className="bg-primary/10 border-primary">
          <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2"><Wallet/>Budget Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
              <p className="text-lg"><strong>Total Estimated Cost:</strong> <span className="text-primary font-bold">${finalList?.totalEstimatedCost.toFixed(2)}</span></p>
              <p className="text-lg"><strong>Your Budget:</strong> ${parseInt(budget).toFixed(2)}</p>
              <p className="text-muted-foreground">{finalList?.budgetAdherence}</p>
          </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {finalList?.estimatedShoppingList.map((item, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="h-full flex flex-col text-center overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <CardContent className="p-4 flex-grow flex flex-col justify-center items-center">
                <div className="w-32 h-32 relative mb-4 bg-white rounded-md flex items-center justify-center">
                    <Image
                        src={`https://placehold.co/128x128.png?text=${item.productName.split(' ').join('+')}`}
                        alt={item.productName}
                        width={128}
                        height={128}
                        className="object-contain rounded-md"
                        data-ai-hint="food item"
                    />
                </div>
                <h3 className="font-bold text-base h-12">{item.productName}</h3>
                <p className="text-xl font-headline text-primary">${item.price.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">({item.priceSource})</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderError = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
        <Card className="max-w-md mx-auto bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2 justify-center"><AlertCircle/> Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
            </CardContent>
            <CardFooter>
                <Button variant="destructive" onClick={handleReset} className="w-full">
                    <RefreshCw className="mr-2" /> Try Again
                </Button>
            </CardFooter>
        </Card>
    </motion.div>
  );
  
  return (
    <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-2">
            <div className="flex justify-center items-center gap-4">
                <Icons.logo className="h-12 w-12 text-primary" />
                <h1 className="font-headline text-5xl tracking-wider">ShopGraph AI</h1>
            </div>
            <p className="text-lg text-muted-foreground">Your intelligent grocery shopping assistant</p>
        </header>

        <main>
            <AnimatePresence mode="wait">
                {step === 'initial' && renderInitialForm()}
                {step === 'loadingRecipes' && renderLoading('Generating Recipe Ideas...')}
                {step === 'showRecipes' && renderRecipes()}
                {step === 'loadingList' && renderLoading('Creating Your Shopping List...')}
                {step === 'showList' && renderShoppingList()}
                {step === 'error' && renderError()}
            </AnimatePresence>
        </main>
    </div>
  );
}
