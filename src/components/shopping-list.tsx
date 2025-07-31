"use client";

import { useState } from "react";
import { Trash2, Plus, Eraser } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type ShoppingListProps = {
  items: string[];
  onAddItem: (item: string) => void;
  onRemoveItem: (item: string) => void;
  onClearList: () => void;
};

export default function ShoppingList({ items, onAddItem, onRemoveItem, onClearList }: ShoppingListProps) {
  const [newItem, setNewItem] = useState("");

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      onAddItem(newItem.trim());
      setNewItem("");
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Grocery Shopping List</CardTitle>
        <CardDescription>Your weekly essentials, all in one place. Add items from meal plans or manually.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
          <Input 
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="e.g., 2 lbs apples"
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        <div className="space-y-4">
          {items.length > 0 ? (
            items.map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center justify-between p-3 bg-card rounded-lg border group">
                <div className="flex items-center gap-3">
                    <Checkbox id={`item-${index}`} className="peer" />
                    <Label htmlFor={`item-${index}`} className="text-base peer-data-[state=checked]:line-through peer-data-[state=checked]:text-muted-foreground transition-colors">
                        {item}
                    </Label>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onRemoveItem(item)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8 border-dashed border-2 rounded-lg">
              <p className="font-semibold">Your shopping list is empty.</p>
              <p className="text-sm">Add items from your meal plans!</p>
            </div>
          )}
        </div>
        
        {items.length > 0 && (
            <div className="mt-6 flex justify-end">
                <Button variant="destructive" size="sm" onClick={onClearList}>
                    <Eraser className="mr-2 h-4 w-4" />
                    Clear List
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
