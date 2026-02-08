/**
 * Showcase service
 * 
 * Manages showcase entries and provides search/filter functionality
 */

import { Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ShowcaseEntry,
  ShowcaseFilterOptions,
  ShowcaseSearchResult,
  ShowcaseStats,
  ShowcaseCategory,
  ImplementationType,
} from './showcase.types';
import { getDefaultShowcaseEntries } from './showcase.data';

/**
 * Showcase service
 */
@Injectable({
  providedIn: 'root',
})
export class ShowcaseService {
  private entriesSubject = new BehaviorSubject<ShowcaseEntry[]>(getDefaultShowcaseEntries());
  private entriesList: ShowcaseEntry[] = getDefaultShowcaseEntries();

  /** Signal of all entries */
  readonly entries: WritableSignal<ShowcaseEntry[]> = signal<ShowcaseEntry[]>(getDefaultShowcaseEntries());

  /** Observable of all entries */
  readonly entries$: Observable<ShowcaseEntry[]> = this.entriesSubject.asObservable();

  constructor() {
    // Load entries
    this.loadEntries();
  }

  /**
   * Get all entries
   */
  getAllEntries(): Observable<ShowcaseEntry[]> {
    return this.entries$;
  }

  /**
   * Get entry by ID
   */
  getEntry(id: string): Observable<ShowcaseEntry | undefined> {
    return this.entries$.pipe(
      map((entries) => entries.find((entry) => entry.id === id))
    );
  }

  /**
   * Get featured entries
   */
  getFeaturedEntries(): Observable<ShowcaseEntry[]> {
    return this.entries$.pipe(
      map((entries) => entries.filter((entry) => entry.featured))
    );
  }

  /**
   * Get entries by category
   */
  getEntriesByCategory(category: ShowcaseCategory): Observable<ShowcaseEntry[]> {
    return this.entries$.pipe(
      map((entries) => entries.filter((entry) => entry.category === category))
    );
  }

  /**
   * Get entries by type
   */
  getEntriesByType(type: ImplementationType): Observable<ShowcaseEntry[]> {
    return this.entries$.pipe(
      map((entries) => entries.filter((entry) => entry.type === type))
    );
  }

  /**
   * Search entries
   */
  search(options: ShowcaseFilterOptions = {}): Observable<ShowcaseSearchResult> {
    return this.entries$.pipe(
      map((entries) => {
        let filtered = [...entries];

        // Filter by category
        if (options.category) {
          filtered = filtered.filter((e) => e.category === options.category);
        }

        // Filter by type
        if (options.type) {
          filtered = filtered.filter((e) => e.type === options.type);
        }

        // Filter by tags
        if (options.tags && options.tags.length > 0) {
          filtered = filtered.filter((e) =>
            options.tags!.some((tag) => e.tags.includes(tag))
          );
        }

        // Filter by company size
        if (options.companySize) {
          filtered = filtered.filter(
            (e) => e.company?.size === options.companySize
          );
        }

        // Filter by featured
        if (options.featured !== undefined) {
          filtered = filtered.filter((e) => e.featured === options.featured);
        }

        // Search query
        if (options.search) {
          const query = options.search.toLowerCase();
          filtered = filtered.filter(
            (e) =>
              e.title.toLowerCase().includes(query) ||
              e.description.toLowerCase().includes(query) ||
              e.tags.some((tag) => tag.toLowerCase().includes(query)) ||
              e.company?.name.toLowerCase().includes(query)
          );
        }

        // Sort
        if (options.sortBy) {
          filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (options.sortBy) {
              case 'date':
                aValue = new Date(a.publishedAt).getTime();
                bValue = new Date(b.publishedAt).getTime();
                break;
              case 'views':
                aValue = a.views ?? 0;
                bValue = b.views ?? 0;
                break;
              case 'likes':
                aValue = a.likes ?? 0;
                bValue = b.likes ?? 0;
                break;
              case 'title':
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
                break;
              default:
                return 0;
            }

            if (options.sortOrder === 'asc') {
              return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
              return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
          });
        }

        // Pagination
        const total = filtered.length;
        const limit = options.limit ?? total;
        const offset = options.offset ?? 0;
        const page = Math.floor(offset / limit) + 1;
        const totalPages = Math.ceil(total / limit);

        const paginated = filtered.slice(offset, offset + limit);

        return {
          entries: paginated,
          total,
          page,
          totalPages,
        };
      })
    );
  }

  /**
   * Get statistics
   */
  getStats(): Observable<ShowcaseStats> {
    return this.entries$.pipe(
      map((entries) => {
        const byCategory: Record<ShowcaseCategory, number> = {
          [ShowcaseCategory.ECOMMERCE]: 0,
          [ShowcaseCategory.SAAS]: 0,
          [ShowcaseCategory.ENTERPRISE]: 0,
          [ShowcaseCategory.API]: 0,
          [ShowcaseCategory.SECURITY]: 0,
          [ShowcaseCategory.COMPLIANCE]: 0,
          [ShowcaseCategory.PUBLIC]: 0,
          [ShowcaseCategory.ADMIN]: 0,
          [ShowcaseCategory.OTHER]: 0,
        };

        const byType: Record<ImplementationType, number> = {
          [ImplementationType.CASE_STUDY]: 0,
          [ImplementationType.CODE_EXAMPLE]: 0,
          [ImplementationType.INTEGRATION]: 0,
          [ImplementationType.TUTORIAL]: 0,
          [ImplementationType.BEST_PRACTICE]: 0,
        };

        let featuredCount = 0;
        let totalViews = 0;
        let totalLikes = 0;

        entries.forEach((entry) => {
          byCategory[entry.category]++;
          byType[entry.type]++;
          if (entry.featured) {
            featuredCount++;
          }
          totalViews += entry.views ?? 0;
          totalLikes += entry.likes ?? 0;
        });

        return {
          totalEntries: entries.length,
          byCategory,
          byType,
          featuredCount,
          totalViews,
          totalLikes,
        };
      })
    );
  }

  /**
   * Get all tags
   */
  getAllTags(): Observable<string[]> {
    return this.entries$.pipe(
      map((entries) => {
        const tags = new Set<string>();
        entries.forEach((entry) => {
          entry.tags.forEach((tag) => tags.add(tag));
        });
        return Array.from(tags).sort();
      })
    );
  }

  /**
   * Add entry (for programmatic addition)
   */
  addEntry(entry: ShowcaseEntry): void {
    this.entriesList.push(entry);
    this.entriesSubject.next([...this.entriesList]);
    this.entries.set([...this.entriesList]);
  }

  /**
   * Update entry
   */
  updateEntry(id: string, updates: Partial<ShowcaseEntry>): void {
    const index = this.entriesList.findIndex((e) => e.id === id);
    if (index !== -1) {
      const existing = this.entriesList[index];
      this.entriesList[index] = { ...existing, ...updates } as ShowcaseEntry;
      this.entriesSubject.next([...this.entriesList]);
      this.entries.set([...this.entriesList]);
    }
  }

  /**
   * Remove entry
   */
  removeEntry(id: string): void {
    this.entriesList = this.entriesList.filter((e) => e.id !== id);
    this.entriesSubject.next([...this.entriesList]);
    this.entries.set([...this.entriesList]);
  }

  /**
   * Increment view count
   */
  incrementViews(id: string): void {
    const entry = this.entriesList.find((e) => e.id === id);
    if (entry) {
      entry.views = (entry.views ?? 0) + 1;
      this.entriesSubject.next([...this.entriesList]);
      this.entries.set([...this.entriesList]);
    }
  }

  /**
   * Increment like count
   */
  incrementLikes(id: string): void {
    const entry = this.entriesList.find((e) => e.id === id);
    if (entry) {
      entry.likes = (entry.likes ?? 0) + 1;
      this.entriesSubject.next([...this.entriesList]);
      this.entries.set([...this.entriesList]);
    }
  }

  /**
   * Load entries
   */
  private loadEntries(): void {
    this.entriesList = getDefaultShowcaseEntries();
    this.entriesSubject.next([...this.entriesList]);
    this.entries.set([...this.entriesList]);
  }
}

