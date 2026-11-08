import type { SetMode } from "@/entities/workout";
import { cn, formatDuration, splitDuration } from "@/shared/lib";
import { Button, Input } from "@/shared/ui";
import { getSetGrid } from "../model/setGrid";
import type { SetDraft, SetField } from "../model/types";
import { useStopwatch } from "../model/useStopwatch";

type SetRowProps = {
  index: number;
  kind: SetMode;
  set: SetDraft;
  weightError?: string;
  repsError?: string;
  durationError?: string;
  rirError?: string;
  canRemove: boolean;
  onChange: (field: SetField, value: string) => void;
  onRemove: () => void;
};

export const SetRow = ({
  index,
  kind,
  set,
  weightError,
  repsError,
  durationError,
  rirError,
  canRemove,
  onChange,
  onRemove,
}: SetRowProps) => {
  const stopwatch = useStopwatch();

  /** Stop writes the measured time into the minutes/seconds fields; it stays editable. */
  const toggleStopwatch = () => {
    if (!stopwatch.running) {
      stopwatch.start();
      return;
    }
    const { minutes, seconds } = splitDuration(stopwatch.stop());
    onChange("minutes", minutes);
    onChange("seconds", seconds);
  };

  return (
    <li className="flex flex-col gap-1">
      <div className={cn("grid items-center gap-2", getSetGrid(kind))}>
        <span className="text-center font-semibold text-text-muted">
          {index + 1}
        </span>
        <Input
          inputMode="decimal"
          placeholder="—"
          aria-label={`Вес, подход ${index + 1}`}
          value={set.weight}
          invalid={Boolean(weightError)}
          onChange={(event) => onChange("weight", event.target.value)}
        />
        {kind === "time" ? (
          <>
            <Input
              inputMode="numeric"
              placeholder="0"
              aria-label={`Минуты, подход ${index + 1}`}
              className="px-1 text-center"
              value={set.minutes}
              invalid={Boolean(durationError)}
              onChange={(event) => onChange("minutes", event.target.value)}
            />
            <Input
              inputMode="numeric"
              placeholder="0"
              aria-label={`Секунды, подход ${index + 1}`}
              className="px-1 text-center"
              value={set.seconds}
              invalid={Boolean(durationError)}
              onChange={(event) => onChange("seconds", event.target.value)}
            />
          </>
        ) : (
          <Input
            inputMode="numeric"
            placeholder="0"
            aria-label={`Повторения, подход ${index + 1}`}
            value={set.reps}
            invalid={Boolean(repsError)}
            onChange={(event) => onChange("reps", event.target.value)}
          />
        )}
        <Input
          inputMode="numeric"
          placeholder="—"
          aria-label={`RIR, подход ${index + 1}`}
          className="px-1 text-center"
          value={set.rir}
          invalid={Boolean(rirError)}
          onChange={(event) => onChange("rir", event.target.value)}
        />
        {canRemove ? (
          <Button
            variant="ghost"
            aria-label={`Удалить подход ${index + 1}`}
            className="px-0"
            onClick={onRemove}
          >
            ✕
          </Button>
        ) : (
          <span />
        )}
      </div>
      {kind === "time" && (
        <Button
          variant={stopwatch.running ? "primary" : "secondary"}
          aria-label={`${stopwatch.running ? "Остановить" : "Запустить"} секундомер, подход ${index + 1}`}
          className="ml-10 bg-surface-raised data-[running=true]:bg-primary"
          data-running={stopwatch.running}
          onClick={toggleStopwatch}
        >
          {stopwatch.running
            ? `■ Стоп · ${formatDuration(stopwatch.elapsedSec)}`
            : "▶ Секундомер"}
        </Button>
      )}
      {(weightError || repsError || durationError || rirError) && (
        <p className="pl-10 text-sm text-danger">
          {weightError ??
            repsError ??
            durationError ??
            (rirError && `RIR: ${rirError}`)}
        </p>
      )}
    </li>
  );
};
