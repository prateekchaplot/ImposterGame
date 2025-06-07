
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Users, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';

export interface PlayerNameEntryProps {
  numberOfPlayers: number;
  category: string;
  gameOption: string; 
  imposterIndices: number[]; // Array of indices for players who are imposters
  onNamesSubmitted: (playerNames: string[]) => void;
}

export function PlayerNameEntryForm({ numberOfPlayers, category, gameOption, imposterIndices, onNamesSubmitted }: PlayerNameEntryProps) {
  const [playerNames, setPlayerNames] = useState<string[]>(Array(numberOfPlayers).fill(''));
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentName, setCurrentName] = useState('');
  const [revealedContent, setRevealedContent] = useState<string | null>(null); // Can be gameOption or "Imposter"
  const { toast } = useToast();

  useEffect(() => {
    setCurrentName(playerNames[currentPlayerIndex] || '');
  }, [currentPlayerIndex, playerNames]);

  useEffect(() => {
    if (!revealedContent) {
      const inputElement = document.getElementById('playerNameInput');
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [currentPlayerIndex, revealedContent]);

  const handleNextPlayer = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (currentName.trim() === '') {
      toast({
        title: "Name Required",
        description: `Please enter a name for Player ${currentPlayerIndex + 1}.`,
        variant: "destructive",
      });
      return;
    }

    const updatedNames = [...playerNames];
    updatedNames[currentPlayerIndex] = currentName.trim();
    setPlayerNames(updatedNames); 

    const isImposter = imposterIndices.includes(currentPlayerIndex);
    setRevealedContent(isImposter ? "Imposter" : gameOption); 
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (revealedContent) {
      timer = setTimeout(() => {
        setRevealedContent(null); 
      }, 3000);
    } else {
      const nameForCurrentIndexJustSubmitted = playerNames[currentPlayerIndex] && playerNames[currentPlayerIndex].trim() !== '';

      if (nameForCurrentIndexJustSubmitted) {
        if (currentPlayerIndex < numberOfPlayers - 1) {
          setCurrentPlayerIndex(prevIndex => prevIndex + 1);
        } else if (currentPlayerIndex === numberOfPlayers - 1) {
          onNamesSubmitted(playerNames);
        }
      }
    }

    return () => clearTimeout(timer);
  }, [revealedContent, playerNames, currentPlayerIndex, numberOfPlayers, onNamesSubmitted]);


  const handlePreviousPlayer = () => {
    if (currentPlayerIndex > 0) {
        setRevealedContent(null); 
        setCurrentPlayerIndex(prevIndex => prevIndex - 1);
    }
  };

  const isLastPlayer = currentPlayerIndex === numberOfPlayers - 1;

  return (
    <Card className="w-full max-w-lg shadow-2xl rounded-xl overflow-hidden">
      <CardHeader className="p-6 md:p-8 bg-primary/5">
        <CardTitle className="text-3xl md:text-4xl font-headline font-bold text-center text-primary">
          Enter Player Names
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground text-base pt-2">
          Game Category: <span className="font-semibold text-primary">{category}</span> | Total Players: <span className="font-semibold text-primary">{numberOfPlayers}</span>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleNextPlayer}>
        <CardContent className="space-y-6 p-6 md:p-8">
          {revealedContent && (
            <div className="p-4 mb-4 bg-accent/20 border border-accent rounded-lg text-center shadow-md">
              <p className="text-sm text-accent-foreground mb-1">
                {revealedContent === "Imposter" ? "Your Role:" : "Your secret item is:"}
              </p>
              <p className="text-xl font-bold text-accent">{revealedContent}</p>
              <p className="text-xs text-muted-foreground mt-1">(Hides in 3 seconds)</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="playerNameInput" className="text-lg font-medium text-foreground block mb-1">
              Player {currentPlayerIndex + 1} of {numberOfPlayers}
            </Label>
            <Input
              id="playerNameInput"
              type="text"
              value={currentName}
              onChange={(e) => setCurrentName(e.target.value)}
              placeholder={`Enter name for Player ${currentPlayerIndex + 1}`}
              className="text-base h-12 rounded-md"
              maxLength={30}
              disabled={!!revealedContent} 
            />
          </div>
          
          {playerNames.filter(name => name !== '').length > 0 && !revealedContent && (
            <div className="space-y-2 pt-4">
              <h4 className="text-md font-medium text-muted-foreground">Players Entered:</h4>
              <div className="flex flex-wrap gap-2">
                {playerNames.map((name, index) => name && (
                  <span key={index} className={`bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm ${index === currentPlayerIndex ? 'ring-2 ring-primary' : ''}`}>
                    {index + 1}. {name}
                  </span>
                ))}
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-between items-center p-6 md:p-8 border-t border-border bg-muted/20">
          {currentPlayerIndex > 0 && (
             <Button 
                type="button" 
                variant="outline" 
                onClick={handlePreviousPlayer}
                className="text-base py-3 h-12 rounded-md"
                disabled={!!revealedContent}
             >
                Previous
             </Button>
          )}
          <Button 
            type="submit"
            className="w-full text-lg font-semibold py-3 h-12 rounded-md shadow-md hover:shadow-lg transition-shadow"
            size="lg"
            style={{marginLeft: currentPlayerIndex > 0 ? 'auto' : '0'}}
            disabled={!!revealedContent} 
          >
            {isLastPlayer ? 'Finish Setup' : 'Next Player'}
            {isLastPlayer ? <CheckCircle className="ml-2 h-5 w-5" /> : <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
