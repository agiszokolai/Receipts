import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';

@Component({
  selector: 'app-select-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-filter.component.html',
  styleUrl: './select-filter.component.scss',
})
export class SelectFilterComponent {
  title = input<string>('');
  options = input<string[]>([]);
  selectedValues = input<string[]>([]);

  @Output() selectionChanged = new EventEmitter<string[]>();

  isVisible = false;
  showAll = false;

  get visibleValues(): string[] {
    return this.showAll ? this.options() : this.options().slice(0, 3);
  }

  onOptionChange(option: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    let updatedValues = [...this.selectedValues()];

    if (isChecked) {
      updatedValues.push(option);
    } else {
      updatedValues = updatedValues.filter((val) => val !== option);
    }

    this.selectionChanged.emit(updatedValues);
  }
}
