"use client"

import * as React from "react"
import { MatchTile } from "./match-tile"
import type { MatchTile as MatchTileType } from "@/types/match"

interface MatchGridProps {
  tiles: MatchTileType[]
  selectedTileId: string | null
  onTileClick: (tile: MatchTileType) => void
}

export function MatchGrid({
  tiles,
  selectedTileId,
  onTileClick,
}: MatchGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <MatchTile
          key={tile.tileId}
          tile={tile}
          isSelected={selectedTileId === tile.tileId}
          onTileClick={onTileClick}
        />
      ))}
    </div>
  )
}
