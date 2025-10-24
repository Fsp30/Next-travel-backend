import { DateRange, UserId, CityId } from '../value-objects';

export interface SearchHistoryProps {
  id: string;
  userId: UserId;
  cityId: CityId;
  travelDateRange?: DateRange;
  searchDate: Date;
  ipAddress?: string;
  userAgent?: string;
}
export class SearchHistory {
  private constructor(private props: SearchHistoryProps) {}

  static create(
    props: Omit<SearchHistoryProps, 'id' | 'searchDate'>
  ): SearchHistory {
    return new SearchHistory({
      ...props,
      id: crypto.randomUUID(),
      searchDate: new Date(),
    });
  }

  static reconstitute(props: SearchHistoryProps): SearchHistory {
    return new SearchHistory(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get cityId(): CityId {
    return this.props.cityId;
  }

  get travelDateRange(): DateRange | undefined {
    return this.props.travelDateRange;
  }

  get searchDate(): Date {
    return this.props.searchDate;
  }

  get ipAdress(): string | undefined {
    return this.props.ipAddress;
  }

  get userAgent(): string | undefined {
    return this.props.userAgent;
  }

  isRecent(daysThreshold: number = 60): boolean {
    const daysDiff = Math.floor(
      (Date.now() - this.props.searchDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff <= daysThreshold;
  }

  hasTravelDates(): boolean {
    return this.props.travelDateRange !== undefined;
  }

  toJSON() {
    return {
      id: this.props.id,
      userId: this.props.userId.toString(),
      cityId: this.props.cityId.toString(),
      travelStartDate: this.props.travelDateRange?.startDate.toISOString(),
      travelEndDate: this.props.travelDateRange?.endDate.toISOString(),
      searchDate: this.props.searchDate.toISOString(),
      ipAddress: this.props.ipAddress,
      userAgent: this.props.userAgent,
    };
  }

  toPrisma() {
    return {
      id: this.props.id,
      userId: this.props.userId.toString(),
      cityId: this.props.cityId.toString(),
      travelStartDate: this.props.travelDateRange?.startDate,
      travelEndDate: this.props.travelDateRange?.endDate,
      searchDate: this.props.searchDate,
      ipAddress: this.props.ipAddress,
      userAgent: this.props.userAgent,
    };
  }
}
