export class Pager {

    static DEFAULT_SIZE_PAGE = 20;

    pageNumber = 0;
    numberOfElements = 0;
    first = true;
    last = true;
    totalPages = 0;
    totalElements = 0;
    size = Pager.DEFAULT_SIZE_PAGE;

    clear(): void {
        this.pageNumber = 0;
        this.first = true;
        this.last = true;
        this.totalPages = 0;
        this.totalElements = 0;
        this.size = Pager.DEFAULT_SIZE_PAGE;
    }

    firstPage(): void {
        this.navigateToPage(this.getFirstPage());
    }

    havePrevious(): boolean {
        return !this.first;
    }

    previous(): void {
        if (!this.havePrevious()) {
            return;
        }
        this.pageNumber --;
    }

    haveNext(): boolean {
        return !this.last;
    }

    next(): void {
        if (!this.haveNext()) {
            return;
        }
        this.pageNumber ++;
    }

    lastPage(): void {
        this.navigateToPage(this.getLastPage());
    }

    getStartIndex(): number {
        return (this.size * this.pageNumber) + 1;
    }

    getLastIndex(): number {
        return (this.size * this.pageNumber) + this.numberOfElements;
    }

    getCurrentPage(): number {
        return this.pageNumber;
    }

    getFirstPage(): number {
        return 0;
    }

    getLastPage(): number {
        return Math.max(this.totalPages - 1, 0);
    }

    navigateToPage(pageIndex: number) {
        if (pageIndex < this.getFirstPage() || pageIndex > this.getLastPage()) {
            return;
        }
        this.pageNumber = pageIndex;
    }

    getNearPages(): number[] {
        const result: number[] = [];
        const ndx = this.getCurrentPage();
        let p = ndx, n = ndx;
        const lastPage = this.getLastPage();
        result.push(ndx);
        while ((p >= 0 || n <= lastPage) && result.length < 5) {
            p--; n++;
            if (p >= 0 && result.length < 5) { result.push(p); }
            if (n <= lastPage && result.length < 5) { result.push(n); }
        }
        result.sort((a, b) => a - b );
        return result;
    }

    getNoResult() {
        return this.numberOfElements === 0;
    }
}
