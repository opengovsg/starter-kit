import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbItemProps,
  BreadcrumbLink,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

interface CrumbProps extends BreadcrumbItemProps {
  href: string;
  label: string;
  last?: boolean;
}
// Props are required as Breadcrumb parent injects props into its crumb children.
const Crumb = ({ href, label, last = false, ...props }: CrumbProps) => {
  if (last) {
    return (
      <BreadcrumbItem isCurrentPage {...props}>
        <BreadcrumbLink>{label}</BreadcrumbLink>
      </BreadcrumbItem>
    );
  }

  return (
    <BreadcrumbItem {...props}>
      <BreadcrumbLink as={Link} href={href}>
        {label}
      </BreadcrumbLink>
    </BreadcrumbItem>
  );
};

interface AppBreadcrumbsProps {
  transformLabel?: (label: string) => string;
  rootLabel?: string;
}

export const AppBreadcrumbs = ({
  transformLabel,
  rootLabel = 'Home',
}: AppBreadcrumbsProps) => {
  const router = useRouter();

  const generateCrumbs = useCallback(() => {
    const pathWithoutQuery = router.asPath.split('?')[0];
    const nestedPaths =
      pathWithoutQuery?.split('/').filter((path) => path.length > 0) ?? [];

    const crumbs: CrumbProps[] = nestedPaths.map((subpath, index) => {
      const href = `/${nestedPaths.slice(0, index + 1).join('/')}`;
      const label = transformLabel?.(subpath) ?? subpath;
      return { href, label };
    });

    return [{ href: '/', label: rootLabel }, ...crumbs];
  }, [rootLabel, router.asPath, transformLabel]);

  const [crumbs, setCrumbs] = useState(generateCrumbs());

  useEffect(() => {
    if (router) {
      setCrumbs(generateCrumbs());
    }
  }, [generateCrumbs, router]);

  return (
    <Breadcrumb textStyle="body-2">
      {crumbs.map((crumb, index) => (
        <Crumb key={index} {...crumb} last={index === crumbs.length - 1} />
      ))}
    </Breadcrumb>
  );
};
